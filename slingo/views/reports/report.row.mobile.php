<?php
    $time = date('H:i', $report['created']->sec);
    $date = date('m/d/Y', $report['created']->sec);
    $report['date'] = ($date == $today) ? $time : $date;
?>
<li id="<?php echo $report['_id']; ?>" class="item<?php if ($report['result']){ ?> resolved<?php } ?>">
    <div class="date"><?php echo $report['date']; ?></div>
    <div class="suspect"><?php echo $report['suspect']['name']; ?></div>
    <div class="reason"><?php echo $reasons[$report['reason']]; ?></div>
    <i class="fa fa-check"></i> 
</li>
