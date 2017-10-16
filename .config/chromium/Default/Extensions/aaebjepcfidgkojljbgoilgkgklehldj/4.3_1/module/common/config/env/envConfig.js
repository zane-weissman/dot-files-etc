/**********************************************************************************
 * Module:          env-config
 *
 * Description:     PRODUCTION environment config. The appropriate environment
 *                  config is taken at build time depending on the --env parameter
 **********************************************************************************/

module.exports = {

    clientId: '985126862784-91g24ti1fns1rek4gvi1hpoejkuc033j.apps.googleusercontent.com',
    clientSecret: 'HdYX2YD8QuDqTx7J-86p2SGP',

    apiUrls: {
        driveUtils: 'https://drive-utils.appspot.com/_ah/api/driveUtils/v1beta'
    },

    gcsBucketUrl: 'https://storage.googleapis.com/awesomedrive',

    analyticsTrackerId: 'UA-61774465-6',

    ufoExtensionId: 'kldfpiebhefepgbjknnlgpeichadmdib'

};