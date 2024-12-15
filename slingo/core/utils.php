<?php

namespace SLingo\Core;

use SLingo\Core\Lang;

class Utils {

    public static function getDateAgoString($date){

        if (!$date) { return; }
        $diff = self::getDateDiff($date);
        $diffParts = array();

        if ($diff[0]){
            $diffParts[] = Lang::getPlural('dateYearsPlural', $diff[0]);
        } else
        if ($diff[1]){
            $diffParts[] = Lang::getPlural('dateMonthsPlural', $diff[1]);
        } else
        if ($diff[2]){
            $diffParts[] = Lang::getPlural('dateDaysPlural', $diff[2]);
        } else
        if ($diff[3]){
            $diffParts[] = Lang::getPlural('dateHoursPlural', $diff[3]);
        } else
        if ($diff[4]){
            $diffParts[] = Lang::getPlural('dateMinutesPlural', $diff[4]);
        }

        if (!$diffParts) {
            return Lang::get('dateJustNow');
        }

        $diffString = trim(implode(' ', $diffParts));

        return Lang::get('dateAgo', $diffString);

    }

    public static function getDateDiff($date1, $date2 = NULL){

        $diff = [];

        if (!is_string($date1)){ return false; }

        if(!$date2) { $date2 = date('Y-m-d H:i:s'); }


        $pattern = '/(\d+)-(\d+)-(\d+)(\s+(\d+):(\d+):(\d+))?/';
        preg_match($pattern, $date1, $matches);
        $d1 = [(int)$matches[1], (int)$matches[2], (int)$matches[3], (int)$matches[5], (int)$matches[6], (int)$matches[7]];

        preg_match($pattern, $date2, $matches);
        $d2 = [(int)$matches[1], (int)$matches[2], (int)$matches[3], (int)$matches[5], (int)$matches[6], (int)$matches[7]];

        for($i=0; $i<count($d2); $i++) {
            if($d2[$i]>$d1[$i]) break;
            if($d2[$i]<$d1[$i]) {
                $t = $d1;
                $d1 = $d2;
                $d2 = $t;
                break;
            }
        }

        $md1 = [31, $d1[0]%4||(!($d1[0]%100)&&$d1[0]%400)?28:29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        $md2 = [31, $d2[0]%4||(!($d2[0]%100)&&$d2[0]%400)?28:29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        $min_v = [NULL, 1, 1, 0, 0, 0];
        $max_v = [NULL, 12, $d2[1]==1?$md2[11]:$md2[$d2[1]-2], 23, 59, 59];

        for($i=5; $i>=0; $i--) {
            if($d2[$i]<$min_v[$i]) {
                $d2[$i-1]--;
                $d2[$i]=$max_v[$i];
            }
            $diff[$i] = $d2[$i]-$d1[$i];
            if($diff[$i]<0) {
                $d2[$i-1]--;
                $i==2 ? $diff[$i] += $md1[$d1[1]-1] : $diff[$i] += $max_v[$i]-$min_v[$i]+1;
            }
        }

        return $diff;

    }

}
