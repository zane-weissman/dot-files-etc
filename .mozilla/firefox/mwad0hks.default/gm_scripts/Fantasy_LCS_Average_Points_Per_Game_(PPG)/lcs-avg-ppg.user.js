// ==UserScript==
// @name        Fantasy LCS Average Points Per Game (PPG)
// @namespace   http://enki1337.net/
// @include     http://fantasy.*.lolesports.com/*/matchups*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version     0.98
// @grant       GM_addStyle
// ==/UserScript==

waitForKeyElements (".week:first-child", actionFunction);

function actionFunction (jNode)
{
    $( ".fantasy-match" ).each(function() {
        weekNum = parseInt( $( this ).parent().attr("data-week") );
        weekMaxGames = 2;
        if ( weekNum==1 || weekNum==7 || weekNum==11 )
            weekMaxGames = 4;
        leftHead  = $( this ).find( ".fantasy-match-header-item > .points" ).children( "*:first-child" );
        rightHead = $( this ).find( ".fantasy-match-header-item > .points" ).children( "*:last-child"  );
        if ( leftHead.find( ".formatted-points" ).hasClass( "formatted-points-projected" ) ) {
            leftGamesPlayed = rightGamesPlayed = weekMaxGames * 7;
        } else {
            leftGamesPlayed  = countGames( $( this ).find ( ".fantasy-map-half-red-team"  ), weekMaxGames );
            rightGamesPlayed = countGames( $( this ).find ( ".fantasy-map-half-blue-team" ), weekMaxGames );
        }
        leftPoints  =  leftHead.find( ".formatted-points" ).attr("data-number");
        rightPoints = rightHead.find( ".formatted-points" ).attr("data-number");
        leftPPG = leftPoints / leftGamesPlayed;
        rightPPG = rightPoints / rightGamesPlayed;
        leftHead.prepend('<span style="font-size: 40%;" >(' +  leftPPG.toFixed(1) +' PPG)</span>');
        rightHead.append('<span style="font-size: 40%;" >(' + rightPPG.toFixed(1) +' PPG)</span>');
    });
}


function countGames ( mapHalf, maxGames )
{
    totalGames = 0;
    mapHalf.children().each(function() {
    
        dotContainer = $( this ).find( ".completed" );
        if( dotContainer.has( ".completed-label" ).length ) {
            totalGames += maxGames;
        } else {
            totalGames += dotContainer.find( ".complete" ).length;
        }
    });
    return totalGames;
}
