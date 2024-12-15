<?php
    use SLingo\Core\User;
    $selfId = User::getId();
?>
<div class="history-room">
    <div class="chat-room">
        <div class="messages">
            <ul>
                <?php foreach($messages as $msg) { ?>
                    <li<?php if ($msg['sender']['id'] == $selfId) { ?> class="my"<?php } ?>>
                        <span class="name"><?php echo html($msg['sender']['name']); ?>:</span> <?php echo html($msg['text']); ?>
                    </li>
                <?php } ?>
            </ul>
        </div>
    </div>
</div>
