const scrapeCategory = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage();
      console.log(">> Mở tab mới");

      await page.goto(url);
      console.log(">> Truy cập vào: ", url);

      await page.waitForSelector("#webpage");
      console.log(">> Website đã load xong...");

      const dataCategory = await page.$$eval(
        "#navbar-menu > ul > li",
        (els) => {
          dataCategory = els.map((el) => {
            return {
              category: el.querySelector("a").innerText,
              link: el.querySelector("a").href,
            };
          });
          return dataCategory;
        }
      );

      await page.close();
      console.log(">> Tab đã đóng...");
      resolve(dataCategory);
    } catch (error) {
      console.log("Lỗi ở scrape category: ", error);
      reject(error);
    }
  });

const scraper = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let newPage = await browser.newPage();
      console.log(">> Đã mở ta mới...");
      await newPage.goto(url);
      console.log(">> Đã truy cập vào trang: ", url);
      await newPage.waitForSelector("#main");
      console.log(">> Đã load xong trang main...");

      const scrapeData = {};

      // Lấy header
      const headerData = await newPage.$eval("header", (el) => {
        return {
          title: el.querySelector("h1").innerHTML,
          description: el.querySelector("p").innerText,
        };
      });
      scrapeData.header = headerData;

      // lấy link detail của item
      const detailLinks = await newPage.$$eval(
        "#left-col > section.section-post-listing > ul > li",
        (els) => {
          detailLinks = els.map((el) => {
            return el.querySelector(".post-meta > h3 > a").href;
          });
          return detailLinks;
        }
      );

      const scraperDetail = async (link) =>
        new Promise(async (resolve, reject) => {
          {
            try {
              let pageDetail = await browser.newPage();
              await pageDetail.goto(link);
              console.log(">> Truy cập: ", link);
              await pageDetail.waitForSelector("#main");

              const detailData = {};
              // bắt đầu cào data về
              // cào ảnh
              const images = await pageDetail.$$eval(
                "#left-col > article > div.post-images > div > div.swiper-wrapper > div.swiper-slide",
                (els) => {
                  images = els.map((el) => {
                    return el.querySelector("img").src;
                  });
                  return images;
                }
              );
              detailData.images = images;

              // lấy header detail
              const header = await pageDetail.$eval(
                "header.page-header",
                (el) => {
                  return {
                    title: el.querySelector("h1 > a").innerText,
                    star: el
                      .querySelector("h1 > span")
                      .className.replace(/^\D+/g, ""),
                    class: {
                      content: el.querySelector("p").innerText,
                      classType: el.querySelector("p > a > strong").innerText,
                    },
                    address: el.querySelector("address").innerText,
                    attributes: {
                      price: el.querySelector(
                        "div.post-attributes > .price > span"
                      ).innerText,
                      acreage: el.querySelector(
                        "div.post-attributes > .acreage > span"
                      ).innerText,
                      published: el.querySelector(
                        "div.post-attributes > .published > span"
                      ).innerText,
                      hashtag: el.querySelector(
                        "div.post-attributes > .hashtag > span"
                      ).innerText,
                    },
                  };
                }
              );
              console.log(header);

              await pageDetail.close();
              console.log(">> Đã đóng tab: ", link);
              resolve();
            } catch (error) {
              console.log("Lấy data detail lỗi: ", error);
              reject(error);
            }
          }
        });

      for (let link of detailLinks) {
        await scraperDetail(link);
      }

      await browser.close();
      console.log(">> Trình duyệt đã đóng...");
      resolve();
    } catch (error) {
      reject(error);
    }
  });

module.exports = {
  scrapeCategory,
  scraper,
};
