let ArrowUp;
let ArrowLeft;
let ArrowRight;
let ArrowDown;
let Run;
let Jump;
let JumpSpin;
let Getting;

let gravidade = 1;
let gravidadeTime = 10
let loopTimeResult = 50;

let gravite = 'on';
let detect;
function playerCommand(value) {
    detect = '';
    gravidade = $('#player').offset().top;
    piso = $('.piso1X').offset().top
    animationGravity();
    function animationGravity() {
        $("#player").css({
            "background-image": "url(./img/mario.png)",
            "background-repeat": "no-repeat",
            "background-size": "1000px",
            "background-position": "-632px -102px",
            "height": "52px",
            "width": "42px",
        });
    }
    let loopTime = setInterval(function () {
        gravity()
    }, loopTimeResult);

    function gravity() {
        gravite = 'on';
        playerY = $('#player')[0].getBoundingClientRect().y
        playerX = $('#player')[0].getBoundingClientRect().x
        $('body').prop("scrollTop", playerY - 420);

        detect = document.elementFromPoint(playerX, playerY + 55).classList.value
        console.log(playerY);
        console.log(detect);
        if (detect == 'piso1X') {
            console.log('stop')
            gravityStop();
            gravite = 'off';
        } else if (detect == 'piso1O') {
            console.log('stop')
            gravityStop();
            gravite = 'off';
        } else {
            $('#player').css({ "top": gravidade });
            gravidade = gravidade + gravidadeTime;
        }
    }

    function gravityStop() {
        clearTimeout(loopTime);
        $("#player").css({
            "background-image": "url(./img/mario.png)",
            "background-repeat": "no-repeat",
            "background-size": "1000px",
            "background-position": "-532px 0px",
            "height": "51px",
            "width": "35px",
        });
    }
}
loadGame();
function loadGame() {
    $('#logo1').fadeIn(3000, function () {
        $('#home').css({ "z-index": "10" })
        $('#pressMsg').html('press space key to continue')
        let keyMenu = 'off';
        $('body').prop("scrollLeft", 0)
        $(document).keyup(function (e) {
            if (keyMenu == 'off') {
                if (e.which == 32) {
                    document.getElementById('coin').play()
                    keyMenu = 'on';
                    loadGame2();
                }
            }
        })
    });
    function loadGame2() {
        $('#logo1').fadeOut(3000, function () {
            $('#home').css({ "background": "none" })
            $('#home').css({ "z-index": "-5" })
            playerCommand();
            document.getElementById('thema').play()
            $('#logo2').fadeIn(3000, function () {
            });
        });
    }
    keyLoad();
}
function keyLoad() {
    if (localStorage.getItem('keyConfig') == null) {
        keyDefault()
    } else {
        database = JSON.parse(localStorage.getItem('keyConfig'))
        databaseKey = JSON.parse(database[0])
        ArrowUp = databaseKey['ArrowUp'];
        ArrowLeft = databaseKey['ArrowLeft'];
        ArrowRight = databaseKey['ArrowRight'];
        ArrowDown = databaseKey['ArrowDown'];
        Run = databaseKey['Run'];
        Jump = databaseKey['Jump'];
        JumpSpin = databaseKey['JumpSpin'];
        Getting = databaseKey['Getting'];
        keyView();
    }
}

function keyView() {
    $("#ArrowUp").val(ArrowUp)
    $("#ArrowLeft").val(ArrowLeft)
    $("#ArrowRight").val(ArrowRight)
    $("#ArrowDown").val(ArrowDown)
    $("#Run").val(Run)
    $("#Jump").val(Jump)
    $("#JumpSpin").val(JumpSpin)
    $("#Getting").val(Getting)

    let save = '';
    $('#keyConfig div input').bind('click', function (e) {
        $('#' + e.target.id).focus();
        save = $('#' + e.target.id).val();
        $('#' + e.target.id).val('')
        $('#' + e.target.id).on('keydown', function (a) {
            $('#' + e.target.id).val('')
            setTimeout(() => {
                $('#' + e.target.id).val(a.which)
            }, 500);
        });
        $('#' + e.target.id).focusout(function () {
            if ($('#' + e.target.id).val() == '') {
                $('#' + e.target.id).val(save);
            } else {
            }
            $('#' + e.target.id).off('keydown');
        });
    })
    $("#saveKeyConfig").click(() => {
        keySave();
    })
}
$("#config").click(() => {
    $("#keyConfig").css({ "display": "inline-block" });
})
function keySave() {

    localStorage.removeItem('keyConfig');
    keyConfigResult = [];


    let database = JSON.stringify({
        ArrowUp: $("#ArrowUp").val(),
        ArrowLeft: $("#ArrowLeft").val(),
        ArrowRight: $("#ArrowRight").val(),
        ArrowDown: $("#ArrowDown").val(),
        Run: $("#Run").val(),
        Jump: $("#Jump").val(),
        JumpSpin: $("#JumpSpin").val(),
        Getting: $("#Getting").val(),
    });

    keyConfigResult.push(database);
    localStorage.setItem('keyConfig', JSON.stringify(keyConfigResult));

    keyLoad();
}

function keyDefault() {
    localStorage.removeItem('keyConfig');
    keyConfigResult = [];


    let database = JSON.stringify({
        ArrowUp: 'ArrowUp',
        ArrowLeft: 'ArrowLeft',
        ArrowRight: 'ArrowRight',
        ArrowDown: 'ArrowDown',
        Run: 'a',
        Jump: 'd',
        JumpSpin: 's',
        Getting: 'f',
    });

    keyConfigResult.push(database);
    localStorage.setItem('keyConfig', JSON.stringify(keyConfigResult));

    keyLoad();
}
ArrowRightUp = 'off';
ArrowLeftUp = 'off';
RunUp = 'off';
JumpUp = 'off';
$(document).keydown(function (e) {

    if (e.which == ArrowRight) {
        if (ArrowRightUp == 'on') {
        } else {
            if (ArrowLeftUp == 'off') {
                ArrowRightPress();
                ArrowRightUp = 'on';
            } else {

            }
        }
    }
    if (e.which == ArrowLeft) {
        if (ArrowLeftUp == 'on') {
        } else {
            if (ArrowRightUp == 'off') {
                ArrowLeftPress();
                ArrowLeftUp = 'on';
            } else {

            }
        }
    }
    if (e.which == Run) {
        if (RunUp == 'on') {
            if (LeftValue >= 10) {
            } else {
                LeftValue++;
            }
        } else {
            RunUp = 'on';
        }
    }
    if (e.which == Jump) {
        if (JumpUp == 'off') {
            JumpPress();
            JumpUp = 'on';
        } else {

        }
    }
    console.log(Run)
    console.log(e.key + ' = ' + e.which);
});

$(document).keyup(function (e) {
    if (e.which == ArrowRight) {
        if (ArrowRightUp == 'on') {
            ArrowRightUp = 'off';
            ArrowRightPress('off');
        } else {
        }
    }
    if (e.which == ArrowLeft) {
        if (ArrowLeftUp == 'on') {
            ArrowLeftUp = 'off';
            ArrowLeftPress('off');
        } else {
        }
    }
    if (e.which == Run) {
        if (RunUp == 'on') {
            LeftValue = 3;
            RunUp = 'off';
        } else {
        }
    }
    if (e.which == Jump) {
        if (JumpUp == 'on') {
            JumpUp = 'off';
            JumpPress('off');
        } else {
        }
    }
    console.log(e.key + ' = ' + e.which);
});
let LeftValue = 3;
function JumpPress(value) {
    console.log('jump')
    playerSave = $("#player").offset().top
    if (gravite == 'on') {

    } else {
        document.getElementById('jump').play()
        loop();
        $("#player").css({
            "background-image": "url(./img/mario.png)",
            "background-repeat": "no-repeat",
            "background-size": "1000px",
            "background-position": "-532px -99px",
            "height": "56px",
            "width": "38px",
        });
    }
    function loop() {
        setTimeout(() => {
            playerY = $("#player").offset().top
            JumpValue = 1;
            $("#player").css({ "top": playerY - JumpValue });
            if (playerSave - 150 >= playerY) {
                playerCommand()
            } else {
                loop()
            }
        }, 5);
    }
}
scroll = 'off';
function ArrowRightPress(value) {
    result = value;
    $("#player").css({ "transform": "rotatey(0deg)" })

    let loopTime = setInterval(function () {
        walk()
    }, 20);
    if (result == 'off') {
        gravityStop()
    } else {
        walkAnimation();
    }
    function walk() {
        console.log(result)
        if (result == 'off') {
            gravityStop()
        } else {
            playerX = $("#player").offset().left
            $("#player").css({ "left": playerX + LeftValue });
        }
        if ($(window).width() - $("#player").offset().left <= 900) {
            scroll = 'on';
            scrollValue = $('body').prop("scrollLeft")
            $('body').prop("scrollLeft", scrollValue + LeftValue)
        }
    }
    function walkAnimation() {
        animation1();
        setTimeout(() => {
            animation1();
        }, 300);
        setTimeout(() => {
            if (result == 'off') {
            } else {
                walkAnimation();
            }
            animation2();
        }, 500);
        function animation1() {
            $("#player").css({
                "background-image": "url(./img/mario.png)",
                "background-repeat": "no-repeat",
                "background-size": "1000px",
                "background-position": "-836px 0px",
                "height": "48px",
                "width": "38px",
            });
        }
        function animation2() {
            $("#player").css({
                "background-image": "url(./img/mario.png)",
                "background-repeat": "no-repeat",
                "background-size": "1000px",
                "background-position": "-532px 0px",
                "height": "51px",
                "width": "38px",
            });
        }
    }
    function gravityStop() {
        clearTimeout(loopTime);
    }
}
function ArrowLeftPress(value) {
    result = value;
    $("#player").css({ "transform": "rotatey(170deg)" })
    let loopTime = setInterval(function () {
        walk()
    }, 20);
    if (result == 'off') {
        gravityStop()
    } else {
        walkAnimation();
    }
    function walk() {
        console.log(result)
        if (result == 'off') {
            gravityStop()
        } else {
            playerX = $("#player").offset().left
            $("#player").css({ "left": playerX - LeftValue });
        }
        if (scroll = 'on') {
            scrollValue = $('body').prop("scrollLeft")
            $('body').prop("scrollLeft", scrollValue - LeftValue)
        }
    }
    function walkAnimation() {
        animation1();
        setTimeout(() => {
            animation1();
        }, 300);
        setTimeout(() => {
            if (result == 'off') {
            } else {
                walkAnimation();
            }
            animation2();
        }, 500);
        function animation1() {
            $("#player").css({
                "background-image": "url(./img/mario.png)",
                "background-repeat": "no-repeat",
                "background-size": "1000px",
                "background-position": "-836px 0px",
                "height": "48px",
                "width": "38px",
            });
        }
        function animation2() {
            $("#player").css({
                "background-image": "url(./img/mario.png)",
                "background-repeat": "no-repeat",
                "background-size": "1000px",
                "background-position": "-532px 0px",
                "height": "51px",
                "width": "38px",
            });
        }
    }
    function gravityStop() {
        clearTimeout(loopTime);
    }
}