const char *colorname[] = {

  /* 8 normal colors */
  [0] = "#151a1f", /* black   */
  [1] = "#4a5a6c", /* red     */
  [2] = "#998c90", /* green   */
  [3] = "#c69f98", /* yellow  */
  [4] = "#606352", /* blue    */
  [5] = "#b2c5cf", /* magenta */
  [6] = "#dc9570", /* cyan    */
  [7] = "#b5b7bb", /* white   */

  /* 8 bright colors */
  [8]  = "#7e8082",  /* black   */
  [9]  = "#4a5a6c",  /* red     */
  [10] = "#998c90", /* green   */
  [11] = "#c69f98", /* yellow  */
  [12] = "#606352", /* blue    */
  [13] = "#b2c5cf", /* magenta */
  [14] = "#dc9570", /* cyan    */
  [15] = "#b5b7bb", /* white   */

  /* special colors */
  [256] = "#151a1f", /* background */
  [257] = "b5b7bb", /* foreground */
  [258] = "#c69f98",     /* cursor */
};

/* Default colors (colorname index)
 * foreground, background, cursor */
 unsigned int defaultbg = 0;
 unsigned int defaultfg = 257;
 unsigned int defaultcs = 258;
