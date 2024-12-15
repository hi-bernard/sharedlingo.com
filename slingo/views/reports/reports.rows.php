<?php
    use SLingo\Core\Request;
    use SLingo\Core\Response;
?>
<?php if ($reports) { ?>
    <?php foreach($reports as $report) { ?>
        <?php
            $view = Request::isMobile() ? 'reports/report.row.mobile' : 'reports/report.row';
            echo Response::render($view, ['report' => $report, 'reasons' => $reasons, 'today' => $today]);
        ?>
    <?php } ?>
<?php }
