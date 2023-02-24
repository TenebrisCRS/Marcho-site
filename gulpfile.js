const {src, dest, watch, parallel, series} = require('gulp');                     //Даём переменным возможности плагина gulp

const scss             = require('gulp-sass')(require('sass'));                       //Даём переменной возможности плагина gulp-sass
const concat           = require('gulp-concat');                                      //Даём переменной возможности плагина gulp-concat
const autoprefixer     = require('gulp-autoprefixer');                                //Даём переменной возможности плагина gulp-autoprefixer
const uglify           = require('gulp-uglify');                                      //Даём переменной возможности плагина gulp-uglify
const imagemin         = require('gulp-imagemin');                                    //Даём переменной возможности плагина gulp-imagemin
const rename           = require('gulp-rename');                                      //Даём переменной возможности плагина gulp-rename
const browserSync      = require('browser-sync').create();                            //Даём переменной возможности плагина browser-sync
const del              = require('del');                                              //Даём переменной возможности плагина del
const nunjucksRender   = require('gulp-nunjucks-render');                             //Даём переменной возможности плагина gulp-nunjacks-render




function browsersync() {                          //Функция для обновления страницы
  browserSync.init({                              //Инициализация по документации
    server: {                                     //инициализируем сервер
      baseDir: 'app/'                             //Место расположения сервера
    },
    notofy: false                                 //Отключения уведомления о перезагрузке страницы
  })
}

function nunjucks() {                             //Функция для препроцессора html
  return src('app/*.njk')                         //Путь к файлу
    .pipe(nunjucksRender())                       //Рендер файлов
    .pipe(dest('app'))                            //Выкидываем обработанные файлы в app
    .pipe(browserSync.stream())                   //Обновляем страницу при изменении
}


function styles () {                              //Функция для стилей
  return src('app/scss/*.scss')                   //Берём данные из всех файлов scss
  .pipe(scss({outputStyle: 'compressed'}))        //Перерабатываем их в css файл. OutputStyle имеет значения expanded (удобный) и compressed (минифицированный)
  // .pipe(concat())                                 //Перемещаем в файл при помощи плагина gulp-concat
  .pipe(rename({                                  //Переименовываем файл
    suffix : '.min'                               //Добавляем min
  }))
  .pipe(autoprefixer({                            //Устанавливаем префиксы при помощи gulp-autoprefixer
    overrideBrowserslist: ['last 10 versions'],   //Дополрительная настройка (применять для последних 10 версий)
    grid: true                                    //Дополнительная настройка (применять для display: grid)
  }))
  .pipe(dest('app/css'))                          //Выкидываем в папку css
  .pipe(browserSync.stream())                     //Используем функцию плагин Browser-sync (2 параметра reload(перезагрузка) и stream) для отображения результатов на странице 
}

function scripts() {                              //Функция для скриптов 
  return src([                                    //Берём данные из:
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'node_modules/rateyo/src/jquery.rateyo.js',
    'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
    'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
    'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))                    //Перемещаем в файл при помощи плакина gulp-concat
  .pipe(uglify())                                 //Минифицируем js-файл
  .pipe(dest('app/js'))                           //Выкидываем в папку js
  .pipe(browserSync.stream())                     //Используем функцию плагин Browser-sync для отображения результатов на странице
}

function images() {
  return src('app/images/**/*.*')                 //Берём все картинки из папки app/images
  .pipe(imagemin([                                //Сжимаем картинки
    imagemin.gifsicle({interlaced: true}),        //Дополнительные настройки с официального руководства
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
      plugins: [
        {removeViewBox: true},
        {cleanupIDs: false}
      ]
    })
  ]))                               
  .pipe(dest('dist/images'))                      //Выкидываем катинки в папку dest/images
}

function build() {                                //Функция для постройки проекта
  return src([                                    //Берём файлы:
    'app/**/*.html',                              //HTML
    'app/css/style.min.css',                      //CSS
    'app/js/main.min.js'                          //JS
   ], {base: 'app'})                              //Доп настройка, которая переносит файлы так, как они были записаны (в тех же папках и втой же последовательности)
  .pipe(dest('dist'))                             //Выкидываем эти файлы в папку dist
}

function cleanDist() {                            //Функция очистки папки dist      
  return del('dist');                             //Удаляем dist при помощи плагина del
}

function watching() {                             //Создаём функцию слежения
  watch(['app/**/*.scss'], styles);          //Активируем функцию слежения за стилями, и при изменении активируем функцию styles
  watch(['app/*.njk'], nunjucks);                 //Активируем функцию слежения за файлами njk, и при изменении активируем функцию nunjucks
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts); //Активируем функцию слежения за скриптами, и при изменении активируем функцию sripts
  watch(['app/**/*.html']).on('change', browserSync.reload); //Используем функцию плагин Browser-sync для отображения результатов на странице
}

exports.styles = styles;                          //Даём возможность gulp объявить функцию styles и использовать её 
exports.scripts = scripts;                        //Даём возможность gulp объявить функцию scripts и использовать её     
exports.browsersync = browsersync;                //Даём возможность gulp объявить функцию browserSync и использовать её     
exports.watching = watching;                      //Даём возможность gulp объявить функцию watching и использовать её 
exports.images = images;                          //Даём возможность gulp объявить функцию images и использовать её 
exports.nunjucks = nunjucks;                      //Даём возможность gulp объявить функцию nunjucks и использовать её 
exports.cleanDist = cleanDist;                    //Даём возможность gulp объявить функцию del и использовать её
exports.build = series(cleanDist, images, build); //Даём возможность gulp через series объявить сразу 3 функции


exports.default = parallel(nunjucks, styles, scripts, browsersync, watching);   //поочерёдно запускаются все плагины