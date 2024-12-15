<div class="members-scroll">

    <table id="reportsList" class="members-list">
        <thead>
            <tr>
                <th width="180"><?php echo t('reportDate'); ?></th>
                <th><?php echo t('reportSuspect'); ?></th>
                <th><?php echo t('reportReporter'); ?></th>
                <th><?php echo t('reportReason'); ?></th>
                <th><?php echo t('reportResult'); ?></th>
            </tr>
        </thead>
        <tbody class="list-body"></tbody>
    </table>

    <div class="more-button">
        <div class="loading"><i class="fa fa-spin fa-gear"></i></div>
        <button id="reportsMoreButton" type="button" class="btn btn-default"><i class="fa fa-arrow-down"></i> <?php echo t('loadMore'); ?></button>
    </div>

</div>

<script src="/moderator/js?file=controllers/reports"></script>
