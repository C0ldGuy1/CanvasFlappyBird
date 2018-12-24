/**
 * Created by C0ldGuy on 2018/12/6.
 */

var theCanvas;

function isCanvasExist(canvasElm) {
    if (!canvasElm || !canvasElm.getContext) {
        return false;
    } else {
        return true;
    }
}

//实现截图功能，a.download是比较新的特性，可能兼容性比较差，不过又不是不能用
function saveImage(e) {
    var a = document.createElement("a");
    a.href = theCanvas.toDataURL();
    a.download = 'img';
    a.click();
}

function canvasApp(canvasElm) {
    var context = canvasElm.getContext('2d');
    var mainInterval;//用于暂停循环
    var column = [{'locX': -40, 'gapY': 100}, {'locX': -240, 'gapY': 300}, {'locX': -440, 'gapY': 352}];//三根柱子的默认数据
    var mountain = [{'locX': -400, 'topYs': [600, 550, 570, 620, 680]}, {'locX': -800, 'topYs': [578, 400, 623, 547, 633]}];//两坐群山初始x坐标和山高
    var bird = {'locX': 300, 'locY': 200, 'speed': 0};//运动小鸟的默认初始位置
    var nearColumn = 0;//最靠近小鸟的柱子，用于进行碰撞检测
    var core = 0;//得分

    //随机数生成柱子间隙的y坐标,返回一个随机数组，参数：length，生成数组的长度；begin、to，随机数的范围[begin,to)
    function getGapY(length, begin, to) {
        if (begin > to || begin < 0 || to < 0) {
            return -1;
        }
        var result = [];
        for (var i = 0; i < length; i++) {
            result.push(Math.random() * (to - begin) + begin);
        }
        return result;
    }

    //绘制一根柱子，参数：locationX:当前柱子的x坐标，gapY:当前柱子间隙的y坐标
    function drawColumn(locationX, gapY) {
        var gr = context.createLinearGradient(locationX, 0, locationX + 40, 0);//柱子颜色渐变
        gr.addColorStop(0, '#14982f');
        gr.addColorStop(0.5, '#ffffff');
        gr.addColorStop(1, '#14982f');
        context.fillStyle = gr;
        context.fillRect(locationX, 0, 40, gapY);
        context.fillRect(locationX, gapY + 150, 40, 700 - gapY - 150);


    }

    //绘制一座背景宽度的山,参数：locationX:当前群山的x坐标，topYs:当前群山的山高数组
    function drawMountain(locationX, topYs) {
        context.beginPath();
        context.fillStyle = '#3f3f3f';
        context.moveTo(locationX, 700);
        context.lineTo(locationX + 40, topYs[0]);
        context.lineTo(locationX + 80, 700 - 1);
        context.lineTo(locationX + 120, topYs[1]);
        context.lineTo(locationX + 160, 700 - 1);
        context.lineTo(locationX + 200, topYs[2]);
        context.lineTo(locationX + 240, 700 - 1);
        context.lineTo(locationX + 280, topYs[3]);
        context.lineTo(locationX + 320, 700 - 1);
        context.lineTo(locationX + 360, topYs[4]);
        context.lineTo(locationX + 400, 700 - 1);
        context.moveTo(locationX, 700);
        context.fill();
        context.closePath();
    }

    //绘制运动的小鸟
    function drawBird(locationX, locationY) {
        context.beginPath();
        context.fillStyle = '#b00f26';
        context.arc(locationX, locationY, 15, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
        context.fill();
        context.closePath();
    }

    //绘制得分数字
    function drawCoreText() {
        context.font = '50px Sans-Serif';
        context.textBaseline = 'top';
        context.textAlign = 'left';
        context.fillStyle = '#f7f7f7';
        context.fillText(core, 0, 0);
    }
    
    //gameover后
    function gameover() {
        
    }

    //主方法，通过不断调用此方法绘制多根移动的柱子
    function move() {
        context.clearRect(0, 0, canvasElm.width, canvasElm.height);
        //处理柱子的运动
        if (column[0].locX >= 400) {  //每满440像素就将数组头删掉，将第二根柱子变成第一根柱子，背景的山也同理
            column.splice(0, 1);  //去掉头元素
            var lastX = column[1].locX - 200;  //以第二根(即删除前的第三根)柱子为基准，生成第三根柱子x坐标和间隙y坐标
            var lastGapY = getGapY(1, 100, 500)[0];
            column.push({'locX': lastX, 'gapY': lastGapY});
            nearColumn = 0;//在第一根柱子被移除以后，原本用来对照的第二根柱子变成了第一根
        }

        //处理山的运动
        if (mountain[0].locX >= 400) {
            mountain.splice(0, 1);
            var lastX2 = mountain[0].locX - 400;
            var lastTopYs = getGapY(5, 600, 650);
            mountain.push({'locX': lastX2, 'topYs': lastTopYs});
        }

        //依次绘制两座山,先绘制山，以免挡住柱子
        for (var j = 0; j < mountain.length; j++) {
            drawMountain(mountain[j].locX, mountain[j].topYs);
            mountain[j].locX += 0.5;
        }
        //依次绘制三根柱子
        for (var i = 0; i < column.length; i++) {
            drawColumn(column[i].locX++, column[i].gapY);
        }

        //绘制运动的小鸟
        if (bird.locY >= 685) {//触碰到底部
            window.clearInterval(mainInterval);//重新开始
        }
        // bird.speed = bird.speed + 0.00098 * 5;//另一种控制运动的方法
        // bird.locY += bird.speed * 5;
        bird.locY += bird.speed * 5 + 1/2 * 0.00098 * 5 * 5;//x = v0T + 1/2 a T2,5ms内的位移，注意单位的转换
        bird.speed = bird.speed + 0.00098 * 5;//vt = v0 + aT， 每5ms速度的变化


        drawBird(bird.locX, bird.locY);

        //碰撞检测
        if (column[nearColumn].locX + 40 > bird.locX - 15) {//判断小鸟是否接近柱子
            if (column[nearColumn].locX >= bird.locX + 15) {//判断小鸟是否已经远离柱子，远离的话，nearColumn加1，分数加1
                nearColumn = 1;
                core++;
                console.log(core);
                //这里绘制分数字符串
            } else {//说明小鸟在柱子中，要判断是否碰撞
                if (bird.locY - 15 <= column[nearColumn].gapY || bird.locY + 15 >= column[nearColumn].gapY + 150) {
                    window.clearInterval(mainInterval);//重新开始
                }
            }
        }
        //最后是绘制得分
        drawCoreText();
    }
    //敲击键盘非空格键触发，给予小鸟一个与下落方向相反的瞬时速度，让其跳起
    function setBirdUp(event) {
        if (event.keyCode != 32) {
            bird.speed = -0.4;
        } else {
            return;
        }
    }

    function gameLoop() {
        move();
    }
    function startGame() {
        window.clearInterval(mainInterval);
        //开始前先初始化所有的数据，包括gameover后也是
        context.clearRect(0, 0, canvasElm.width, canvasElm.height);
        column = [{'locX': -40, 'gapY': 100}, {'locX': -240, 'gapY': 300}, {'locX': -440, 'gapY': 352}];//三根柱子的默认数据
        mountain = [{'locX': -400, 'topYs': [600, 550, 570, 620, 680]}, {'locX': -800, 'topYs': [578, 400, 623, 547, 633]}];//两坐群山初始x坐标和山高
        bird = {'locX': 300, 'locY': 200, 'speed': 0};//运动小鸟的默认初始位置
        nearColumn = 0;//最靠近小鸟的柱子，用于进行碰撞检测
        core = 0;//得分
        mainInterval = window.setInterval(gameLoop, 5);
    }
    document.getElementById('startBtn').addEventListener('click', startGame, false);
    window.addEventListener('keydown', setBirdUp, false);
}

window.onload = function () {
    var createImageDataBtn = document.getElementById('createImageData');
    createImageDataBtn.addEventListener('click', saveImage);

    theCanvas = document.getElementById('mainCanvas');
    if (isCanvasExist(theCanvas)) {
        theCanvas.width = '400';
        theCanvas.height = '700';
        canvasApp(theCanvas);
    } else {
        alert('Your browser does not support canvas!');
    }
}