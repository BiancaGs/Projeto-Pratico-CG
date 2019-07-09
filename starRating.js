
$(function () {


    $('.star').click(function () {

        var target = this;

        animarEstrela(target);

    })


})

function animarEstrela(target) {
    $(target).children('.selected').addClass('is-animated');
    $(target).children('.selected').addClass('pulse');

    setTimeout(function () {
        $(target).children('.selected').removeClass('is-animated');
        $(target).children('.selected').removeClass('pulse');
    }, 1000);
}

function updateStarState(target) {
    $(target).parent().prevAll().addClass('animate');
    $(target).parent().prevAll().children().addClass('star-colour');

    $(target).parent().nextAll().removeClass('animate');
    $(target).parent().nextAll().children().removeClass('star-colour');
}

function setFullStarState(target) {
    $(target).addClass('star-colour');
    $(target).parent().addClass('animate');

    updateStarState(target)
}