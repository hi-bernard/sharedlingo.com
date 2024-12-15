<?php
    use SLingo\Core\Request;
    use SLingo\Core\Response;
?>
<?php if ($members) { ?>
    <?php foreach($members as $member) { ?>
        <?php
            $view = Request::isMobile() ? 'members/member.mobile' : 'members/member';
            echo Response::render($view, ['member' => $member]);
        ?>
    <?php } ?>
<?php }
