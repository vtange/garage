'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
//var nodemon = require('gulp-nodemon');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-clean-css');
var rename = require('gulp-rename');

var paths = {
  sass: ['scss/**/*.scss']
};

gulp.task('sass', function(done) {
  gulp.src('scss/app.scss')
    .pipe(sass())
    .pipe(gulp.dest('css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('css/'))
    .on('end', done);
});

gulp.task('default', function () {
	browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(['*.html','css/**', 'js/**'], ['sync']);
});

gulp.task('sync', function() {
    browserSync.reload();
});