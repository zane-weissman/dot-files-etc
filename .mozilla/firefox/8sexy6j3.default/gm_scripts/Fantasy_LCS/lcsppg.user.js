// ==UserScript==
// @name        Fantasy LCS
// @namespace   http://frichter.de
// @include     http://fantasy.*.lolesports.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version     0.2.2
// @grant       GM_addStyle
// ==/UserScript==

function countGames(mapHalf, maxGames, isLeft) {
    "use strict";
    /*global $, waitForKeyElements */
	var totalGames = 0;
    mapHalf.children().each(function () {
        var points = $(this).find(".formatted-points"),
            team = $(this).find(".team-and-position"),
            proPoints = parseFloat(points.attr("data-number")),
            dotContainer = $(this).find(".completed"),
            proGames = 0,
			proPPG;
        if (dotContainer.has(".completed-label").length) {
            proGames = maxGames;
        } else {
            proGames = dotContainer.find(".complete").length;
        }
        if (proGames > 0) {
            proPPG = proPoints / proGames;
        } else {
            proPPG = 0;
        }
        if (isLeft) {
            team.append('<span>(' + proPPG.toFixed(1) + ' PPG)</span>');
        } else {
            team.prepend('<span>(' + proPPG.toFixed(1) + ' PPG)</span>');
        }
        totalGames += proGames;
    });
    return totalGames;
}

function actionFunction() {
    "use strict";
	$(".fantasy-match").each(function () {
        var weekNum = parseInt($(this).parent().attr("data-week"), 10),
            weekMaxGames = 2,
			leftHead  = $(this).find(".fantasy-match-header-item > .points").children("*:first-child"),
            rightHead = $(this).find(".fantasy-match-header-item > .points").children("*:last-child"),
            leftName = $(this).find(".summoner-name" + ".red-team"),
            rightName = $(this).find(".summoner-name" + ".blue-team"),
			leftGamesPlayed,
			rightGamesPlayed,
			leftPoints,
			rightPoints,
			leftPPG,
			rightPPG,
            leftTotalGames = 0,
            rightTotalGames = 0;

		if (weekNum === 1 || weekNum === 7 || weekNum === 11) {
			weekMaxGames = 4;
		}
        if (leftHead.find(".formatted-points").hasClass("formatted-points-projected")) {
            leftGamesPlayed = rightGamesPlayed = weekMaxGames * 7;
        } else {
            leftTotalGames = leftGamesPlayed  = countGames($(this).find(".fantasy-map-half-red-team"), weekMaxGames, true);
            rightTotalGames = rightGamesPlayed = countGames($(this).find(".fantasy-map-half-blue-team"), weekMaxGames, false);
        }
        leftPoints = leftHead.find(".formatted-points").attr("data-number");
        rightPoints = rightHead.find(".formatted-points").attr("data-number");
        leftPPG = leftPoints / leftGamesPlayed;
        rightPPG = rightPoints / rightGamesPlayed;
        leftHead.prepend('<span style="font-size: 40%;" >' + leftPPG.toFixed(1) + '</span>');
        rightHead.append('<span style="font-size: 40%;" >' + rightPPG.toFixed(1) + '</span>');
        leftName.append('<span> (' + leftTotalGames + ' Games played)</span>');
        rightName.prepend('<span>(' + rightTotalGames + ' Games played) </span>');
    });
}

waitForKeyElements(".week:first-child", actionFunction);