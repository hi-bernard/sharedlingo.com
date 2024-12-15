<div class="dialog-message daily-stats">

    <form action="/admin/stats" method="post" class="stats-form">

        <div id="chart-toolbar">
            <button class="btn btn-default btn-prev-month"><i class="fa fa-chevron-left"></i></button>
            <select class="form-control btn btn-default month-select" name="month">
                <?php foreach($months as $num => $name) { ?>
                    <option value="<?php echo $num; ?>" <?php if ($num==$month) { ?>selected="selected"<?php } ?>><?php echo $name; ?></option>
                <?php } ?>
            </select>
            <select class="form-control btn btn-default year-select" name="year">
                <?php foreach($years as $num) { ?>
                    <option value="<?php echo $num; ?>" <?php if ($num==$year) { ?>selected="selected"<?php } ?>><?php echo $num; ?></option>
                <?php } ?>
            </select>
            <button class="btn btn-default btn-next-month"><i class="fa fa-chevron-right"></i></button>
        </div>

        <canvas id="chart-canvas"></canvas>

    </form>

</div>

