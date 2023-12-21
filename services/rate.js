const fs = require("fs");
const path = require("path");
const CustomError = require('../utils/custom-error');

const BaseService = require("./data");
const isValidDateFormat = require('../utils/date-validator');

class RateService {
  async getAllCtrsByDate(date) {
    if (!isValidDateFormat(date)) {
      throw new CustomError('Invalid date format! Please use format: yyyy-mm-dd.', 400);
    }
    const dataPath = path.join(__dirname, "..", "data");
    let filenames;
    try {
      filenames = await BaseService.getFilenames(dataPath);
    } catch (error) {
      console.log("Error:", error.message);
      throw error;
    }
    const filenamesOfOneDate = filenames.filter((filename) =>
      filename.includes(`sessions_${date}`)
    );

    const filesData = await Promise.all(
      filenamesOfOneDate.map(async (file) => {
        const filePath = path.join(dataPath, file);
        const headers = ["session", "view", "ad_click", "campaign"];
        const fileData = await BaseService.processFile(filePath, headers);
        return fileData;
      })
    );

    const grouped = await this.groupByCampaign(filesData.flat());
    for (const campaign in grouped) {
      if (grouped.hasOwnProperty(campaign)) {
        grouped[campaign] = await this.calculateCtr(
          Object.values(await this.groupBySession(grouped[campaign]))
        );
      }
    }
    return Object.values(grouped);
  }

  async groupByCampaign(filesData) {
    return filesData.reduce((acc, current) => {
      return {
        ...acc,
        [current.campaign]: acc[current.campaign]
          ? [...acc[current.campaign], current]
          : [current],
      };
    }, {});
  }

  async groupBySession(filesData) {
    return filesData.reduce((acc, current) => {
      return {
        ...acc,
        [current.session]: acc[current.session]
          ? {
              campaign: current.campaign,
              view:
                Number(current.view) > Number(acc[current.session].view)
                  ? Number(current.view)
                  : Number(acc[current.session].view),
              ad_click:
                Number(current.ad_click) > Number(acc[current.session].ad_click)
                  ? Number(current.ad_click)
                  : Number(acc[current.session].ad_click),
            }
          : {
              campaign: current.campaign,
              view: Number(current.view),
              ad_click: Number(current.ad_click),
            },
      };
    }, {});
  }

  async calculateCtr(groupedBySession) {
    const sumViewsAndClicks = groupedBySession.reduce(
      (accumulator, current) => {
        accumulator.campaign = current.campaign;
        accumulator.view += current.view;
        accumulator.ad_click += current.ad_click;
        return accumulator;
      },
      { campaign: "", view: 0, ad_click: 0 }
    );
    sumViewsAndClicks.ctr = sumViewsAndClicks.ad_click
      ? Number((sumViewsAndClicks.ad_click / sumViewsAndClicks.view).toFixed(1))
      : 0;
    delete sumViewsAndClicks.view;
    delete sumViewsAndClicks.ad_click;
    return sumViewsAndClicks;
  }
}

module.exports = new RateService();
