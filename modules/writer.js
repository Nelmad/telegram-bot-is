var Config = require('../config.json');
var Format = require('string-template');
var Shedule = require('./shedule')(Config.source);
var Lang = require('../lang.json');

function formatTime(time) {
    return time;
}

function formatTimePeriod(period) {
    return Format(Lang.time_period, {
        b: formatTime(period.b),
        e: formatTime(period.e)
    });
}

function getIndexEmoji(i){
    return i +'&#8419;';
}

var Formatter = {
    welcome: function () {
        return text = Format(Lang.welcome, {});
    },

    week: function (week) {
        if (!week) {
            week = Shedule.getCurrentWeek();
        }

        var days_list = "";

        Shedule.getShedule(week).forEach(function (day, id) {
            days_list += Formatter.day(id, week);
        });

        return text = Format(Lang.week, {
            week_header: Format(Lang.week_header, {
                week_type: Lang['week_type_' + week]
            }),
            days_list: days_list,
            week_footer: Format(Lang.week_footer, {
                week_type: Lang['week_type_' + (week == 'odd' ? 'even' : 'odd')],
                week_type_key: week == 'odd' ? 'even' : 'odd'
            })
        });
    },

    day: function (id, week) {
        id = id !== undefined ? id : Shedule.getCurrentDay();
        week = week ? week : Shedule.getCurrentWeek();


        var day = Shedule.getShedule(week, id);
        var shedule = "";
        day.forEach(function (item, i) {
            var t = item[week];

            if (!t.title) {
                t = {
                    title: Lang.lesson_not_found,
                    cab: ''
                }
            }
            shedule += Format(Lang.shedule_item, {
                    //time: formatTimePeriod(Shedule.getTime(i)),
                    index: getIndexEmoji((i + 1)) + " ",
                    title: t.title,
                    cab: t.cab
                }) + "\n";
        });

        var dt = Shedule.getDayTitle(id);
        return text = Format(Lang.week_day_item, {
            sep: '&#12336;'.repeat((dt.length / 2) + 2),
            day_title: dt,
            day_shedule: shedule
        });
    },

    lesson: function (day, week, time) {
        var now = new Date();
        day = day !== undefined ? day : (now.getDay() - 1);
        week = week ? week : Shedule.getCurrentWeek();
        time = time ? time : {
            h: now.getHours(),
            m: now.getMinutes()
        };
        var lesson = Shedule.getLessonByTime(Shedule.getShedule(week, day), week, time);
        if (!lesson) {
            return Format(Lang.lesson_item, {
                day: Shedule.getDayTitle(day),
                time: time.h + ':' + time.m,
                shedule: Lang.lesson_not_found,
                footer: Lang.lesson_footer
            });
        }


        return Format(Lang.lesson_item, {
            day: Shedule.getDayTitle(day),
            time: time.h + ':' + time.m,
            shedule: Format(Lang.shedule_item, {
                time: formatTimePeriod(lesson.time),
                title: lesson.title,
                cab: lesson.cab
            }),
            footer: Lang.lesson_footer
        });
    },

    next: function (day, week, time) {
        var now = new Date();
        day = day ? day : (now.getDay() - 1);
        week = week ? week : Shedule.getCurrentWeek();
        time = time ? time : {
            h: now.getHours(),
            m: now.getMinutes()
        };

        var lesson = Shedule.getLessonByTime(Shedule.getShedule(week, day), week, Shedule.getNextBegin(time));
        if (!lesson) {
            return Format(Lang.lesson_item, {
                day: Shedule.getDayTitle(day),
                time: time.h + ':' + time.m,
                shedule: Lang.next_lesson_not_found
            });
        }

        return Format(Lang.lesson_item, {
            day: Shedule.getDayTitle(day),
            time: time.h + ':' + time.m,
            shedule: Format(Lang.shedule_item, {
                time: formatTimePeriod(lesson.time),
                title: lesson.title,
                cab: lesson.cab
            })
        });
    },

    tomorrow: function () {
        return Formatter.day(Shedule.getDay(Shedule.incDate(1)));
    }
};

module.exports = Formatter;