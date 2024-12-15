<div class="dialog-message name-color-edit">

    <form id="nameColorForm" method="POST" action="/profile/color-save">

        <div class="preview-block">
            <div class="name" style="color:<?php echo $color; ?>">
                <h3><?php echo $user['name']['full']; ?></h3>
                <div><i class="fa fa-<?php echo $user['genderClass']; ?>"></i> <?php echo $user['name']['full']; ?></div>
            </div>
            <div class="bright-notice notice"><i class="fa fa-exclamation-triangle"></i> <?php echo t('colorTooBright'); ?></div>
            <div class="dark-notice notice"><i class="fa fa-exclamation-triangle"></i> <?php echo t('colorTooDark'); ?></div>
        </div>

        <div class="colorpicker-block">
            <input type="text" name="color" class="colorpicker" data-default="<?php echo $defaultColor; ?>" value="<?php echo $color; ?>">
        </div>

    </form>

</div>

<script src="/static/js/controllers/profilecolor.js"></script>
