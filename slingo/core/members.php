<?php

namespace SLingo\Core;
use SLingo\Core\Lang;
use SLingo\Core\Storage;
use SLingo\Core\Utils;

class Members {

    public static function getAllIds($isOnlineOnly = false, $asStrings = true){

        $ids = [];
        $query = $isOnlineOnly ? ['online' => true] : [];
        $cursor = Storage::get('members')->find($query, ['_id']);

        foreach($cursor as $doc){
            $ids[] = $asStrings ? $doc['_id']->{'$id'} : $doc['_id'];
        }

        return $ids;

    }

    public static function getMember($id){

        return Storage::get('members')->findOne(['_id' => Storage::getMongoId($id)]);

    }

    public static function parse($member){

        $genders = [
            'm' => 'mars',
            'f' => 'venus',
            'o' => 'genderless',
        ];

        $countries = Lang::getCountriesList();
        $country = $countries[$member['location']['countryCode']];
        $city = $member['location']['city'];

        $langs = Lang::getLanguagesList();
        $learns = [];
        $speaks = [];

        foreach($member['langs']['natives'] as $langId){
            $speaks[] = $langs[$langId];
        }

        foreach($member['langs']['learns'] as $langId){
            $learns[] = $langs[$langId];
        }

        $parsedMember = array_merge($member, [
            'age' => date('Y') - $member['bornYear'],
            'dates' => [
                'signed' => Utils::getDateAgoString(date('Y-m-d H:i:s', $member['dates']['signed']->sec)),
                'online' => Utils::getDateAgoString(date('Y-m-d H:i:s', $member['dates']['online']->sec)),
            ],
            'genderClass' => $genders[$member['gender']],
            'location' => [
                'country' => $country,
                'full' => $country . (empty($city) ? '' : ', ' . $city)
            ],
            'speaks' => implode(', ', $speaks),
            'learns' => implode(', ', $learns)
        ]);

        return $parsedMember;

    }

}
