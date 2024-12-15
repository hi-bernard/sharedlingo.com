<div id="membersFilter" class="toolbar">
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

    <table id="membersList" class="members-list">
        <thead>
            <tr>
                <th width=""><?php echo t('name'); ?></th>
                <th width="150"><?php echo t('historyDate'); ?></th>
                <th width="150"><?php echo t('historyMessagesCount'); ?></th>
            </tr>
        </thead>
        <tbody class="list-body"></tbody>
    </table>

    <div class="more-button">
        <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
        <button id="historyMoreButton" type="button" class="btn btn-default"><i class="fa fa-arrow-down"></i> <?php echo t('loadMore'); ?></button>
    </div>

    <div class="members-empty-msg"></div>

</div>
