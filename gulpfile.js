const gulp = require("gulp");
const del = require("del");
const packageJSON = require("./package.json");
const echomdVersion = packageJSON.dependencies["@0xgg/echomd"];

gulp.task("copy-css-files", function (cb) {
  del.sync(`./public/styles/echomd*`);
  gulp
    .src(["./node_modules/@0xgg/echomd/theme/**/*"])
    .pipe(gulp.dest(`./public/styles/echomd@${echomdVersion}/`));
  cb();
});
