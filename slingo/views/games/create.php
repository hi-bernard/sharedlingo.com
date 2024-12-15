<div class="dialog-message game-create">

    <form id="gameCreateForm">

        <div class="form-group game-select">
            <label class="control-label" for="gameType"><?php echo t('gameType'); ?></label>
            <select id="gameType" name="gameType" class="form-control">
                <?php foreach($games as $gameType => $game) { ?>
                    <option value="<?php echo $gameType; ?>"><?php echo $game['title']; ?></option>
                <?php } ?>
            </select>
        </div>

        <div class="form-group game-rules">
            <div class="arrow-up"></div>
            <?php foreach($games as $gameType => $game) { ?>
                <div class="game-<?php echo $gameType; ?> rules-block"><?php echo $game['rules']; ?></div>
            <?php } ?>
        </div>

        <div class="form-group">
            <label class="control-label" for="gameLang"><?php echo t('gameLanguage'); ?></label>
            <select id="gameLang" name="gameLang" class="form-control">
                <?php foreach($langs as $langId => $lang) { ?>
                    <option value="<?php echo $langId; ?>"><?php echo $lang; ?></option>
                <?php } ?>
            </select>
        </div>

        <div class="form-group">
            <label class="control-label" for="gameMaxPlayers"><?php echo t('gameMaxPlayers'); ?></label>
            <select id="gameMaxPlayers" name="gameMaxPlayers" class="form-control">
                <option value="2">2</option>
                <option value="4" selected="selected">4</option>
                <option value="8">8</option>
            </select>
        </div>

    </form>

</div>
