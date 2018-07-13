
module.exports=function (gulp,Plugins,config) {

    const TaskName=config.TaskName;

    gulp.task(TaskName.CleanAll,(cb)=> Plugins.del([],cb));


    gulp.task(TaskName.Test,()=>
        gulp.src(config.DocRex)
            .pipe(Plugins.maginMd2Html(config.options))
            .pipe(Plugins.rename({
                extname: ".html"
            }))
            .pipe(gulp.dest(config.ReleaseDir))
    );

};