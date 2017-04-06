var canvas, ctx,
    brush = {
        x: 0,
        y: 0,
        color: '#000000',
        size: 1,
        down: false,
    },
    strokes = [],
    currentStroke = null,
    drawing = true,
    img = new Image();

function move(e){
    $('#circle').css('top', e.pageY-Math.floor(brush.size/2)+'px')
    $('#circle').css('left', e.pageX-Math.floor(brush.size/2)+'px')
    $('#circle').css('height', brush.size)
    $('#circle').css('width', brush.size)
    $('#circle').css('border', 'solid 1px ' + brush.color)
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width(), canvas.height());
    ctx.fillStyle = $('#background-color-picker').val()
    ctx.fillRect(0, 0, canvas.width(), canvas.height())
    getDataFromStorage()
    ctx.lineCap = 'round';
    for (var i = 0; i < strokes.length; i++) {
        var s = strokes[i];
        if(s.drawing){
        ctx.strokeStyle = s.color;
        ctx.globalCompositeOperation = 'source-over';
    }
    else{
        ctx.globalCompositeOperation = "destination-out";

    }
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (var j = 0; j < s.points.length; j++) {
            var p = s.points[j];
            ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }
    if(img.src != ""){
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 450, 0);
    }
}

function init() {
    canvas = $('#draw');
    canvas.attr({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    ctx = canvas[0].getContext('2d');

    getDataFromStorage()

    function mouseEvent(e) {
        brush.x = e.pageX;
        brush.y = e.pageY;

        currentStroke.points.push({
            x: brush.x,
            y: brush.y,
        });

        redraw();
    }

    canvas.mousedown(function (e) {
        brush.down = true;

        currentStroke = {
            color: brush.color,
            size: brush.size,
            points: [],
            drawing: drawing
        };

        strokes.push(currentStroke);

        mouseEvent(e);
    }).mouseup(function (e) {
        brush.down = false;

        mouseEvent(e);

        currentStroke = null;
    }).mousemove(function (e) {
        if (brush.down)
            mouseEvent(e);
    });

    $('#save-btn').click(function () {
        window.open(canvas[0].toDataURL());
    });

    $('#undo-btn').click(function () {
        strokes.pop();
        redraw();
    });

    $('#clear-btn').click(function () {
        strokes = [];
        img.src = ""
        localStorage.removeItem('dataUrl')
        redraw();
    });

    $('#pokemon-btn').click(function () {
        if($('#pokemon-slct').val() == 0){
            img.src = "pokemon/pikachu.png";
            redraw()
        }else if($('#pokemon-slct').val() == 1){
            img.src = "pokemon/bulbasaur.png";
            redraw()
        }else if($('#pokemon-slct').val() == 2){
            img.src = "pokemon/charmander.png";
            redraw()
        }
        else{
            img.src = "pokemon/squirtle.png";
            redraw()
        }
        img.onload = function () {
            ctx.drawImage(img, 450, 0);
        }
    });

    $('#color-btn').click(function(){
        brush.size = 1;
        $('#brush-size').val(brush.size)
        drawing = false
        canvas.click(function(e){
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
            var imgData = ctx.getImageData(x,y,1,1).data;
            brush.color = rgbToHex(imgData[0], imgData[1], imgData[2]);
            $('#color-picker').val(brush.color);
            drawing = true;
        })
    })

    $('#background-color-picker').on('input', function () {
        ctx.fillStyle = this.value
        ctx.fillRect(0, 0, canvas.width(), canvas.height())
        drawing = true
        redraw()
    });

    $('#color-picker').on('input', function () {
        brush.color = this.value;
        drawing = true;
        redraw()
    });

    $('#brush-size').on('input', function () {
        brush.size = this.value;
    });

    $('#erase-btn').click(function(){
        eraser()
    })

    $('#store-btn').click(function () {
        var dataUrl = canvas[0].toDataURL();
        localStorage.setItem('dataUrl', dataUrl);
        console.log('saved');
    });
    /*
    $('#retrieve-btn').click(function () {
        var dataUrl = localStorage.getItem('dataUrl');
        drawDataURIOnCanvas(dataUrl);
        console.log('loaded');
    });*/

    $('#draw').on('mousemove',move)

    $('#draw').bind('mousewheel', function(e) {
        if(e.originalEvent.wheelDelta / 120 > 0) {
            brush.size += 5;
            $('#brush-size').val(brush.size);
        }
        else {
            if(brush.size > 6){
                brush.size -= 5;
                $('#brush-size').val(brush.size);
            }
            else{
                brush.size = 1
                $('#brush-size').val(brush.size);
            }
        }
    });
}

function getDataFromStorage(){
    if(localStorage.getItem('dataUrl')!=null){
        var dataUrl = localStorage.getItem('dataUrl');
        drawDataURIOnCanvas(dataUrl);
    }
}

function drawDataURIOnCanvas(strDataURI) {
    var img = new window.Image();
    img.addEventListener("load", function () {
        ctx.drawImage(img, 0, 0);
    });
    img.setAttribute("src", strDataURI);
}

function componentToHex(c){
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r,g,b){
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function eraser(){
    drawing = false;
}

$(init);