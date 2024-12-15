<?php
    use SLingo\Core\Request;
    use SLingo\Core\Response;
?>
<?php if ($rooms) { ?>
    <?php foreach($rooms as $room) { ?>
        <?php
            $view = Request::isMobile() ? 'history/room.mobile' : 'history/room';
            echo Response::render($view, ['room' => $room]);
        ?>
    <?php } ?>
<?php }
