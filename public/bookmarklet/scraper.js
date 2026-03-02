(function () {
  "use strict";

  // ===== Configuration =====
  // Change this to your deployed GGS URL
  var GGS_URL = "http://localhost:3000";

  // ===== Platform Detection =====
  var hostname = window.location.hostname;
  var platform = null;
  var scraperFn = null;

  if (hostname.includes("epicgames.com")) {
    platform = "PC";
    scraperFn = scrapeEpic;
  } else if (
    hostname.includes("store.playstation.com") ||
    hostname.includes("library.playstation.com")
  ) {
    platform = "PS";
    scraperFn = scrapePSN;
  } else {
    showMessage(
      "GGS: 이 사이트는 지원되지 않습니다.\n" +
      "지원 플랫폼: Epic Games Store, PlayStation Store\n" +
      "현재 사이트: " +
      hostname
    );
    return;
  }

  // ===== Epic Games Scraper =====
  function scrapeEpic() {
    var games = [];

    // Strategy 1: library page and transaction page game cards
    var selectors = [
      'span.MuiTypography-ui-medium', // User provided: Transaction page game title
      '[class*="am-hoct6b"]',          // User provided: specific class for game title
      '[class*="TransactionItem_description"]', // Common transaction item class
      '[data-testid="library-game-card"] span',
      '[class*="GameListItem"] span',
      ".css-rgqwpc", // common Epic class for game titles
      '[data-component="OfferCardInfo"] h6',
      '[data-component="Message"]',
    ];

    for (var i = 0; i < selectors.length; i++) {
      var els = document.querySelectorAll(selectors[i]);
      if (els.length > 0) {
        els.forEach(function (el) {
          var name = el.textContent.trim();
          if (name && name.length > 1 && name.length < 200) {
            games.push(name);
          }
        });
        break;
      }
    }

    // Strategy 2: aria-label on links containing game names
    if (games.length === 0) {
      var links = document.querySelectorAll('a[aria-label]');
      links.forEach(function (a) {
        var label = a.getAttribute("aria-label");
        if (label && label.length > 1 && label.length < 200) {
          games.push(label);
        }
      });
    }

    return dedupe(games);
  }

  // ===== PlayStation Scraper =====
  function scrapePSN() {
    var games = [];

    var selectors = [
      '[data-qa="collection#702#item"] span',
      ".ems-sdk-product-tile__title",
      '[class*="GameTile"] span',
      '[data-qa*="game-name"]',
      ".psw-t-body",
    ];

    for (var i = 0; i < selectors.length; i++) {
      var els = document.querySelectorAll(selectors[i]);
      if (els.length > 0) {
        els.forEach(function (el) {
          var name = el.textContent.trim();
          if (name && name.length > 1 && name.length < 200) {
            games.push(name);
          }
        });
        break;
      }
    }

    // Fallback: look for img alt texts that might be game names
    if (games.length === 0) {
      var imgs = document.querySelectorAll("img[alt]");
      imgs.forEach(function (img) {
        var alt = img.getAttribute("alt");
        if (alt && alt.length > 2 && alt.length < 200) {
          games.push(alt);
        }
      });
    }

    return dedupe(games);
  }

  // ===== Helpers =====
  function dedupe(arr) {
    var seen = {};
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      var lower = arr[i].toLowerCase();
      if (!seen[lower]) {
        seen[lower] = true;
        result.push(arr[i]);
      }
    }
    return result;
  }

  function showMessage(msg) {
    alert(msg);
  }

  // ===== Main =====
  var gameNames = scraperFn();

  if (!gameNames || gameNames.length === 0) {
    showMessage(
      "GGS import: 게임을 찾지 못했습니다.\n\n" +
      "라이브러리 페이지에서 모든 게임이 보이도록 스크롤한 후 다시 시도해주세요.\n\n" +
      "그래도 안 되면 GGS에서 직접 입력 방식을 이용해주세요."
    );
    return;
  }

  var data = {
    platform: platform,
    games: gameNames,
    scrapedAt: new Date().toISOString(),
    sourceUrl: window.location.href,
  };

  var encoded = btoa(encodeURIComponent(JSON.stringify(data)));
  var url = GGS_URL + "/library/import#data=" + encoded;

  showMessage(
    "GGS Library import: " +
    gameNames.length +
    "개의 게임을 찾았습니다!\n" +
    "library 가져오기 페이지로 이동합니다."
  );

  window.open(url, "_blank");
})();
