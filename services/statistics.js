const fs = require("fs");
const path = require("path");
const CustomError = require('../utils/custom-error');

const BaseService = require("./data");
const isValidDateFormat = require('../utils/date-validator');

class StatisticsService {
  async getStatisticsForPeriod(startDate, endDate) {

    if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
      throw new CustomError('Invalid date format! Please use format: yyyy-mm-dd.', 400);
    }
    const periodDates = await this.getPeriodFilenames(startDate, endDate);

    const dataPath = path.join(__dirname, "..", "data");
    let allFilenames;
    try {
      allFilenames = await BaseService.getFilenames(dataPath);
    } catch (error) {
      console.log("Error:", error.message);
      throw error;
    }
    const neededFilenames = await this.getIntersection(periodDates, allFilenames);

    const filesData = await Promise.all(
      neededFilenames.map(async (file) => {
        const filePath = path.join(dataPath, file);
        const headers = ["day", "session", "view", "ad_click"];
        const fileData = await BaseService.processFile(filePath, headers);
        return fileData;
      })
    );

    const grouped = await this.groupByDay(filesData.flat());
    
    let statistics = [];
    for (const day in grouped) {
      if (grouped.hasOwnProperty(day)) {
        const sumViewsAndClicks = await this.calculateStatistics(grouped[day]);
        sumViewsAndClicks.date = day;
        statistics.push(sumViewsAndClicks);
      }
    }
    return statistics;
  }

  async calculateStatistics(groupedDay) {
    const sumViewsAndClicks = groupedDay.reduce(
      (accumulator, current) => {
        accumulator.session = accumulator.session ? [...accumulator.session, current.session] : [current.session];
        accumulator.views += Number(current.view);
        accumulator.clicks += Number(current.ad_click);
        return accumulator;
      },
      { session: "", views: 0, clicks: 0 }
    );
    sumViewsAndClicks.uniqueSessions = sumViewsAndClicks.session.length;
    delete sumViewsAndClicks.session;
    return sumViewsAndClicks;
  }

  async getIntersection(datesSelected, datesAll) {
    let result = [];
    for (let date of datesSelected) {
      result.push(
        datesAll.filter((filename) => filename.includes(date))
      );
    }
    return result.flat();
  }

  async getPeriodFilenames(startDate, endDate) {
    const dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      dateArray.push(`sessions_${await this.formatDate(new Date(currentDate))}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  }

  async formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }


  async groupByDay(filesData) {
    return filesData.reduce((acc, current) => {
      return {
        ...acc,
        [current.day]: acc[current.day]
          ? [...acc[current.day], current]
          : [current],
      };
    }, {});
  }
}

module.exports = new StatisticsService();
