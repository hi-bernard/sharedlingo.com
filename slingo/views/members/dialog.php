<div id="membersFilter" class="toolbar">
    <form action="/members/get" method="post">
        <input type="hidden" name="mode" value="<?php echo $mode; ?>">
        <div class="field">
            <label class="control-label" for="countryCode"><?php echo t('country'); ?></label>
            <select id="countryCode" name="country" class="form-control selectpicker" data-live-search="true">
                <option value=""><?php echo t('anyPlaceholder'); ?></option>
                <?php foreach($countries as $code => $country) { ?>
                    <option value="<?php echo $code; ?>"><?php echo $country; ?></option>
                <?php } ?>
            </select>
        </div>
        <div class="field">
            <label class="control-label" for="nativeLang"><?php echo t('speaks'); ?></label>
            <select id="nativeLang" name="native" class="form-control selectpicker" data-live-search="true">
                <option value=""><?php echo t('anyPlaceholder'); ?></option>
                <?php foreach($langs as $code => $lang) { ?>
                    <?php if ($code == '-') { ?>
                        <option data-divider="true"></option>
                    <?php } else { ?>
                        <option value="<?php echo $code; ?>"><?php echo $lang; ?></option>
                    <?php } ?>
                <?php } ?>
            </select>
        </div>
        <div class="field">
            <label class="control-label" for="learnLang"><?php echo t('learns'); ?></label>
            <select id="learnLang" name="learns" class="form-control selectpicker" data-live-search="true">
                <option value=""><?php echo t('anyPlaceholder'); ?></option>
                <?php foreach($langs as $code => $lang) { ?>
                    <?php if ($code == '-') { ?>
                        <option data-divider="true"></option>
                    <?php } else { ?>
                        <option value="<?php echo $code; ?>"><?php echo $lang; ?></option>
                    <?php } ?>
                <?php } ?>
            </select>
        </div>
        <div class="field">
            <label class="control-label" for="name"><?php echo t('name'); ?></label>
            <input id="name" type="text" class="btn-group form-control" name="name">
        </div>
        <div class="field">
            <label class="control-label label-hidden"></label>
            <button type="button" class="find-button btn btn-primary">
                <i class="fa fa-search"></i>
            </button>
        </div>
    </form>
</div>

<div class="members-scroll">

    <table id="membersList" class="members-list">
        <thead>
            <tr>
                <th width="180"><?php echo t('name'); ?></th>
                <th width="60"><?php echo t('age'); ?></th>
                <th width="110"><?php echo t('country'); ?></th>
                <th><?php echo t('speaks'); ?></th>
                <th><?php echo t('learns'); ?></th>
                <th width="110"><?php echo t('dateOnline'); ?></th>
            </tr>
        </thead>
        <tbody class="list-body"></tbody>
    </table>

    <div class="more-button">
        <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
        <button id="membersMoreButton" type="button" class="btn btn-default"><i class="fa fa-arrow-down"></i> <?php echo t('loadMore'); ?></button>
    </div>

    <div class="members-empty-msg"></div>

</div>

<script src="/static/js/controllers/memberslist.js"></script>
