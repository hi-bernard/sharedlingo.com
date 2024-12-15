<?php if ($domains) { ?>
    <?php foreach($domains as $domain) { ?>
        <tr id="<?php echo $domain['_id']; ?>" class="item">
            <td><?php echo $domain['_id']; ?></td>
            <td class="domain"><span><?php echo $domain['domain']; ?></span></td>
        </tr>
    <?php } ?>
<?php }
