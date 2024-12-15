<div id="shit-mail-dialog">

    <div id="mailFilter" class="toolbar">
        <form action="/admin/shit-mail-get" method="post">
            <div class="field">
                <input id="domain" type="text" class="btn-group form-control" name="domain">
                <button type="button" class="find-button btn btn-primary">
                    <i class="fa fa-search"></i>
                </button>
            </div>
        </form>
    </div>

    <div class="members-scroll">

        <table id="domainsList" class="members-list">
            <thead>
                <tr>
                    <th width="80">ID</th>
                    <th><?php echo t('mailDomain'); ?></th>
                </tr>
            </thead>
            <tbody class="list-body"></tbody>
        </table>

        <div class="more-button">
            <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
            <button id="domainsMoreButton" type="button" class="btn btn-default"><i class="fa fa-arrow-down"></i> <?php echo t('loadMore'); ?></button>
        </div>

    </div>

</div>

