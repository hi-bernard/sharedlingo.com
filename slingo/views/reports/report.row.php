<?php
    $time = date('H:i', $report['created']->sec);
    $date = date('m/d/Y', $report['created']->sec);
    $report['date'] = ($date == $today) ? $time : $date;
?>
<tr id="<?php echo $report['_id']; ?>" class="item<?php if ($report['result']){ ?> resolved<?php } ?>">
    <td><?php echo $report['date']; ?></td>
    <td><strong><?php echo $report['suspect']['name']; ?></strong></td>
    <td><?php echo $report['reporter']['name']; ?></td>
    <td><?php echo $reasons[$report['reason']]; ?></td>
    <td><?php echo $report['result'] ? t('reportResultYes') : t('reportResultNo'); ?></td>
</tr>
