const fs = require("fs");
const csv = require("csv-parser");

class DataService {
    getFilenames(path) {
        return new Promise((resolve, reject) => {
          fs.readdir(path, { withFileTypes: true }, (err, content) => {
            if (err) {
              reject(err);
            } else {
              const fileNames = content.map((file) => file.name);
              resolve(fileNames);
            }
          });
        });
      }

      async processFile(filePath, headers) {
        return new Promise((resolve, reject) => {
          const result = [];
          fs.createReadStream(filePath, "utf-8")
            .pipe(
              csv({
                mapHeaders: ({ header, index }) => {
                  return headers.includes(header) ? header : null;
                },
              }).on("data", (data) => {
                result.push(data);
              })
            )
            .on("end", () => {
              resolve(result);
            })
            .on("error", (error) => {
              reject("Error reading CSV file:", error.message);
            });
        });
      }
}

module.exports = new DataService();
