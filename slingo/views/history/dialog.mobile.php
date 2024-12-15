<div id="membersFind">
    <div id="membersFilter" class="visible">
        <div class="shortcut">
            <i class="fa fa-search"></i></span>
        </div>
        <form action="/history/get" method="post">
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

        <div id="membersList" class="members-list">
            <ul class="list-body"></ul>
        </div>

        <div class="more-button">
            <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
            <button id="historyMoreButton" type="button" class="btn btn-default"><i class="fa fa-arrow-down"></i> <?php echo t('loadMore'); ?></button>
        </div>

        <div class="members-empty-msg"></div>

    </div>
</div>
