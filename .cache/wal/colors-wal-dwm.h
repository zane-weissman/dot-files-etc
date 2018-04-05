static const char norm_fg[] = "#b5b7bb";
static const char norm_bg[] = "#151a1f";
static const char norm_border[] = "#7e8082";

static const char sel_fg[] = "#b5b7bb";
static const char sel_bg[] = "#998c90";
static const char sel_border[] = "#b5b7bb";

static const char urg_fg[] = "#b5b7bb";
static const char urg_bg[] = "#4a5a6c";
static const char urg_border[] = "#4a5a6c";

static const char *colors[][3]      = {
    /*               fg           bg         border                         */
    [SchemeNorm] = { norm_fg,     norm_bg,   norm_border }, // unfocused wins
    [SchemeSel]  = { sel_fg,      sel_bg,    sel_border },  // the focused win
    [SchemeUrg] =  { urg_fg,      urg_bg,    urg_border },
};
