<?php
    $cols = 8;
    $padding = 4;

    $s = [];
    foreach(glob('smileys/*.png') as $file){
        $file = basename($file);
        preg_match('/^emotion_([a-z]+)\.png$/i', $file, $m);
        $s[$m[1]] = $file;
    }

    $count = count($s);
    $rows = ceil($count / $cols);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>test</title>
    <style>
        body{
            padding:40px;
        }
        ul, li {
            margin:0; padding:0; list-style:none;
        }
        ul {
            overflow: hidden;
            border:solid 1px #ECECEC;
            display: inline-block;
            width:194px;
        }
        li {
            float:left;
            padding:<?php echo $padding; ?>px;
        }
        li:hover {
            background:#ECECEC;
        }
        .ph{
            width:16px;
            height:16px;
            background:#f4e2b5;
        }
        #button { margin:15px 0; }
        #result {
            display:none;
            padding:20px;
            border:solid 1px #999;
        }

    </style>
    <script src="/static/js/libs/jquery.min.js"></script>
    <script src="/static/js/libs/jquery-ui.min.js"></script>
</head>
<body>

    <ul>
        <?php foreach($s as $id=>$img) { ?>
            <li id="<?php echo $id; ?>">
                <img src="smileys/<?php echo $img; ?>">
            </li>
        <?php } ?>
    </ul>

    <div id="button">
        <button id="go">Generate</button>
    </div>

    <div id="result">
        <?php
            $w = (16+$padding*2) * $cols;
            $h = (16+$padding*2) * $rows;
        ?>
        <div id="image">
            <canvas id="canvas" width="<?php echo $w; ?>" height="<?php echo $h; ?>"></canvas>
        </div>
        <pre></pre>
    </div>

<script>

    $('ul').sortable({
        placeholder: "ph"
    });

    $('#go').click(generate);

    function generate(){

        var cols = <?php echo $cols; ?>;
        var padding = <?php echo $padding; ?>;

        var imgSize = 16 + padding*2;

        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        var css = '';

        $('li').each(function(index){

            var r = Math.floor(index / cols);
            var c = Math.floor(index - r*cols);

            console.log(index+': ' + c+','+r);

            var x = c*16 + padding*(c+1) + padding*c;
            var y = r*16 + padding*(r+1) + padding*r;

            var img = new Image();
            img.src = $(this).find('img').attr('src');

            ctx.drawImage(img,x,y);

            css += '.em-' + $(this).attr('id')+'{ background-position: -'+x+'px -'+y+'px; }\n';

        });

        $('#result pre').html(css);
        $('#result').show();

    }

</script>
</body>
</html>