<div id="membersFind">

    <div id="membersFilter" class="visible">
        <div class="shortcut">
            <i class="fa fa-search"></i></span>
        </div>
        <form action="/members/get" method="post">
            <input type="hidden" name="mode" value="<?php echo $mode; ?>">
            <div class="field">
                <label class="control-label" for="countryCode"><?php echo t('country'); ?></label>
                <select id="countryCode" name="country" class="form-control">
                    <option value=""><?php echo t('anyPlaceholder'); ?></option>
                    <?php foreach($countries as $code => $country) { ?>
                        <option value="<?php echo $code; ?>"><?php echo $country; ?></option>
                    <?php } ?>
                </select>
            </div>
            <div class="field">
                <label class="control-label" for="nativeLang"><?php echo t('speaks'); ?></label>
                <select id="nativeLang" name="native" class="form-control">
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
                <select id="learnLang" name="learns" class="form-control">
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
                <button type="button" class="find-button btn btn-primary"><?php echo t('search'); ?></button>
            </div>
        </form>
    </div>

    <div class="members-scroll">

        <div id="membersList" class="members-list">
            <ul class="list-body"></ul>
        </div>

        <div class="more-button">
            <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
            <button id="membersMoreButton" type="button" class="btn btn-default"><i class="fa fa-arrow-down"></i> <?php echo t('loadMore'); ?></button>
        </div>

        <div class="members-empty-msg"></div>

    </div>

</div>

<script src="/static/js/controllers/memberslist.js"></script>
