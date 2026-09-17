const dhakaFullLocations: Record<string, string[]> = {
  // ═══════════════════════════════════════════════════════════
  // ঢাকা উত্তর সিটি কর্পোরেশন (DNCC)
  // ═══════════════════════════════════════════════════════════

  "মিরপুর (Mirpur)": [
    "মিরপুর ১ (Mirpur 1)", "মিরপুর ২ (Mirpur 2)", "মিরপুর ৩ (Mirpur 3)",
    "মিরপুর ৪ (Mirpur 4)", "মিরপুর ৫ (Mirpur 5)", "মিরপুর ৬ (Mirpur 6)",
    "মিরপুর ৭ (Mirpur 7)", "মিরপুর ৮ (Mirpur 8)", "মিরপুর ৯ (Mirpur 9)",
    "মিরপুর ১০ (Mirpur 10)", "মিরপুর ১১ (Mirpur 11)", "মিরপুর ১১.৫ (Mirpur 11.5)",
    "মিরপুর ১২ (Mirpur 12)", "মিরপুর ১৩ (Mirpur 13)", "মিরপুর ১৪ (Mirpur 14)",
    "মিরপুর ডিওএইচএস (Mirpur DOHS)", "মিরপুর ক্যান্টনমেন্ট (Mirpur Cantonment)",
    "মিরপুর সিরামিক (Mirpur Ceramic)", "মিরপুর সেকশন ১ (Mirpur Section 1)",
    "মিরপুর সেকশন ২ (Mirpur Section 2)", "মিরপুর সেকশন ৩ (Mirpur Section 3)",
    "মিরপুর সেকশন ৪ (Mirpur Section 4)", "মিরপুর সেকশন ৫ (Mirpur Section 5)",
    "মিরপুর সেকশন ৬ (Mirpur Section 6)", "মিরপুর সেকশন ৭ (Mirpur Section 7)",
    "মিরপুর সেকশন ৮ (Mirpur Section 8)", "মিরপুর সেকশন ৯ (Mirpur Section 9)",
    "মিরপুর সেকশন ১০ (Mirpur Section 10)", "মিরপুর সেকশন ১১ (Mirpur Section 11)",
    "মিরপুর সেকশন ১২ (Mirpur Section 12)", "মিরপুর সেকশন ১৩ (Mirpur Section 13)",
    "মিরপুর সেকশন ১৪ (Mirpur Section 14)",
    "মিরপুর ১ ব্লক এ (Mirpur 1 Block A)", "মিরপুর ১ ব্লক বি (Mirpur 1 Block B)",
    "মিরপুর ১ ব্লক সি (Mirpur 1 Block C)", "মিরপুর ১ ব্লক ডি (Mirpur 1 Block D)",
    "মিরপুর ১ ব্লক ই (Mirpur 1 Block E)", "মিরপুর ১ ব্লক এফ (Mirpur 1 Block F)",
    "মিরপুর ২ ব্লক এ (Mirpur 2 Block A)", "মিরপুর ২ ব্লক বি (Mirpur 2 Block B)",
    "মিরপুর ২ ব্লক সি (Mirpur 2 Block C)", "মিরপুর ২ ব্লক ডি (Mirpur 2 Block D)",
    "মিরপুর ২ ব্লক ই (Mirpur 2 Block E)", "মিরপুর ২ ব্লক এফ (Mirpur 2 Block F)",
    "মিরপুর ১০ ব্লক এ (Mirpur 10 Block A)", "মিরপুর ১০ ব্লক বি (Mirpur 10 Block B)",
    "মিরপুর ১০ ব্লক সি (Mirpur 10 Block C)", "মিরপুর ১০ ব্লক ডি (Mirpur 10 Block D)",
    "মিরপুর ১১ ব্লক এ (Mirpur 11 Block A)", "মিরপুর ১১ ব্লক বি (Mirpur 11 Block B)",
    "মিরপুর ১১ ব্লক সি (Mirpur 11 Block C)", "মিরপুর ১১ ব্লক ডি (Mirpur 11 Block D)",
    "মিরপুর ১১ ব্লক ই (Mirpur 11 Block E)", "মিরপুর ১১ ব্লক এফ (Mirpur 11 Block F)",
    "মিরপুর ১২ ব্লক এ (Mirpur 12 Block A)", "মিরপুর ১২ ব্লক বি (Mirpur 12 Block B)",
    "মিরপুর ১২ ব্লক সি (Mirpur 12 Block C)", "মিরপুর ১২ ব্লক ডি (Mirpur 12 Block D)",
    "মিরপুর ১৩ ব্লক এ (Mirpur 13 Block A)", "মিরপুর ১৩ ব্লক বি (Mirpur 13 Block B)",
    "মিরপুর ১৩ ব্লক সি (Mirpur 13 Block C)", "মিরপুর ১৩ ব্লক ডি (Mirpur 13 Block D)",
    "মিরপুর ১৪ ব্লক এ (Mirpur 14 Block A)", "মিরপুর ১৪ ব্লক বি (Mirpur 14 Block B)",
    "মিরপুর ১৪ ব্লক সি (Mirpur 14 Block C)", "মিরপুর ১৪ ব্লক ডি (Mirpur 14 Block D)",
    "মিরপুর বাজার (Mirpur Bazar)", "মিরপুর চিড়িয়াখানা রোড (Mirpur Zoo Road)",
    "মিরপুর বাঙলা কলেজ এলাকা (Mirpur Bangla College Area)",
    "মিরপুর কাঁচাবাজার (Mirpur Kachabazar)",
    "মিরপুর স্টেডিয়াম এলাকা (Mirpur Stadium Area)",
    "শেরে বাংলা ক্রিকেট স্টেডিয়াম এলাকা (Sher-e-Bangla Cricket Stadium Area)",
    "পল্লবী (Pallabi)", "বর্ধিত পল্লবী (Extended Pallabi)",
    "নতুন পল্লবী (New Pallabi)", "মিল্কভিটা রোড (Milkvita Road)",
    "সুজাতনগর (Sujatnagar)", "হরুনাবাদ (Harunabad)",
    "মল্লিকা হাউজিং (Mallika Housing)", "আরিফাবাদ (Arifabad)",
    "ছায়ানীড় (Chayanir)", "আলুবদী (Alubdi)", "দুয়ারীপাড়া (Duaripara)",
    "রূপনগর (Rupnagar)", "রূপনগর টিনশেড (Rupnagar Tinshed)",
    "ইস্টান হাউজিং (Eastan Housing)", "কাজীপাড়া (Kazipara)",
    "শেওড়াপাড়া (Shewrapara)", "কাফরুল (Kafrul)", "ইব্রাহিমপুর (Ibrahimpur)",
    "সেনপাড়া পর্বতা (Senpara Parbata)", "শিয়ালবাড়ী (Shialbari)",
    "পীরেরবাগ (Pirerbag)", "মাজার রোড (Mazar Road)",
    "বাউনিয়া বাঁধ (Baunia Badh)", "শাহ আলী (Shah Ali)", "গাবতলী (Gabtoli)",
    "দারুস সালাম (Darus Salam)", "গোলারটেক (Golartek)",
    "বাইশটেকি (Baishteki)", "বাউনিয়াবাধ (Bauniabad)",
    "বুড়িরটেক (Burirtek)", "কালশী (Kalshi)",
    "কালশী সরকার বাড়ী (Kalshi Sarkar Bari)", "মদিনা নগর (Madina Nagar)",
    "পলাশনগর (Palashnagar)",
    "বোটানিক্যাল গার্ডেন এলাকা (Botanical Garden Area)",
    "জাতীয় চিড়িয়াখানা এলাকা (National Zoo Area)",
    "পল্লবী ব্লক এ (Pallabi Block A)", "পল্লবী ব্লক বি (Pallabi Block B)",
    "পল্লবী ব্লক সি (Pallabi Block C)", "পল্লবী ব্লক ডি (Pallabi Block D)",
    "পল্লবী ব্লক ই (Pallabi Block E)", "পল্লবী ব্লক এফ (Pallabi Block F)",
    "রূপনগর ব্লক এ (Rupnagar Block A)", "রূপনগর ব্লক বি (Rupnagar Block B)",
    "রূপনগর ব্লক সি (Rupnagar Block C)", "রূপনগর ব্লক ডি (Rupnagar Block D)",
    "কাজীপাড়া ব্লক এ (Kazipara Block A)", "কাজীপাড়া ব্লক বি (Kazipara Block B)",
    "কাজীপাড়া ব্লক সি (Kazipara Block C)", "কাজীপাড়া ব্লক ডি (Kazipara Block D)",
    "শেওড়াপাড়া ব্লক এ (Shewrapara Block A)", "শেওড়াপাড়া ব্লক বি (Shewrapara Block B)",
    "শেওড়াপাড়া ব্লক সি (Shewrapara Block C)", "শেওড়াপাড়া ব্লক ডি (Shewrapara Block D)",
    "কাফরুল ব্লক এ (Kafrul Block A)", "কাফরুল ব্লক বি (Kafrul Block B)",
    "কাফরুল ব্লক সি (Kafrul Block C)", "কাফরুল ব্লক ডি (Kafrul Block D)",
    "শাহ আলী ব্লক এ (Shah Ali Block A)", "শাহ আলী ব্লক বি (Shah Ali Block B)",
    "শাহ আলী ব্লক সি (Shah Ali Block C)", "শাহ আলী ব্লক ডি (Shah Ali Block D)",
    "দারুস সালাম ব্লক এ (Darus Salam Block A)", "দারুস সালাম ব্লক বি (Darus Salam Block B)",
    "দারুস সালাম ব্লক সি (Darus Salam Block C)", "দারুস সালাম ব্লক ডি (Darus Salam Block D)"
  ],

  "উত্তরা (Uttara)": [
    "উত্তরা মডেল টাউন (Uttara Model Town)",
    "উত্তরা সেক্টর ১ (Uttara Sector 1)", "উত্তরা সেক্টর ২ (Uttara Sector 2)",
    "উত্তরা সেক্টর ৩ (Uttara Sector 3)", "উত্তরা সেক্টর ৪ (Uttara Sector 4)",
    "উত্তরা সেক্টর ৫ (Uttara Sector 5)", "উত্তরা সেক্টর ৬ (Uttara Sector 6)",
    "উত্তরা সেক্টর ৭ (Uttara Sector 7)", "উত্তরা সেক্টর ৮ (Uttara Sector 8)",
    "উত্তরা সেক্টর ৯ (Uttara Sector 9)", "উত্তরা সেক্টর ১০ (Uttara Sector 10)",
    "উত্তরা সেক্টর ১১ (Uttara Sector 11)", "উত্তরা সেক্টর ১২ (Uttara Sector 12)",
    "উত্তরা সেক্টর ১৩ (Uttara Sector 13)", "উত্তরা সেক্টর ১৪ (Uttara Sector 14)",
    "উত্তরা সেক্টর ১৫ (Uttara Sector 15)", "উত্তরা সেক্টর ১৬ (Uttara Sector 16)",
    "উত্তরা সেক্টর ১৭ (Uttara Sector 17)", "উত্তরা সেক্টর ১৮ (Uttara Sector 18)",
    "উত্তরা সেক্টর ১ ব্লক এ (Uttara Sector 1 Block A)",
    "উত্তরা সেক্টর ১ ব্লক বি (Uttara Sector 1 Block B)",
    "উত্তরা সেক্টর ১ ব্লক সি (Uttara Sector 1 Block C)",
    "উত্তরা সেক্টর ১ ব্লক ডি (Uttara Sector 1 Block D)",
    "উত্তরা সেক্টর ২ ব্লক এ (Uttara Sector 2 Block A)",
    "উত্তরা সেক্টর ২ ব্লক বি (Uttara Sector 2 Block B)",
    "উত্তরা সেক্টর ২ ব্লক সি (Uttara Sector 2 Block C)",
    "উত্তরা সেক্টর ৩ ব্লক এ (Uttara Sector 3 Block A)",
    "উত্তরা সেক্টর ৩ ব্লক বি (Uttara Sector 3 Block B)",
    "উত্তরা সেক্টর ৩ ব্লক সি (Uttara Sector 3 Block C)",
    "উত্তরা সেক্টর ৪ ব্লক এ (Uttara Sector 4 Block A)",
    "উত্তরা সেক্টর ৪ ব্লক বি (Uttara Sector 4 Block B)",
    "উত্তরা সেক্টর ৪ ব্লক সি (Uttara Sector 4 Block C)",
    "উত্তরা সেক্টর ৪ ব্লক ডি (Uttara Sector 4 Block D)",
    "উত্তরা সেক্টর ৫ ব্লক এ (Uttara Sector 5 Block A)",
    "উত্তরা সেক্টর ৫ ব্লক বি (Uttara Sector 5 Block B)",
    "উত্তরা সেক্টর ৫ ব্লক সি (Uttara Sector 5 Block C)",
    "উত্তরা সেক্টর ৬ ব্লক এ (Uttara Sector 6 Block A)",
    "উত্তরা সেক্টর ৬ ব্লক বি (Uttara Sector 6 Block B)",
    "উত্তরা সেক্টর ৬ ব্লক সি (Uttara Sector 6 Block C)",
    "উত্তরা সেক্টর ৭ ব্লক এ (Uttara Sector 7 Block A)",
    "উত্তরা সেক্টর ৭ ব্লক বি (Uttara Sector 7 Block B)",
    "উত্তরা সেক্টর ৭ ব্লক সি (Uttara Sector 7 Block C)",
    "উত্তরা সেক্টর ৭ ব্লক ডি (Uttara Sector 7 Block D)",
    "উত্তরা সেক্টর ৮ ব্লক এ (Uttara Sector 8 Block A)",
    "উত্তরা সেক্টর ৮ ব্লক বি (Uttara Sector 8 Block B)",
    "উত্তরা সেক্টর ৮ ব্লক সি (Uttara Sector 8 Block C)",
    "উত্তরা সেক্টর ৯ ব্লক এ (Uttara Sector 9 Block A)",
    "উত্তরা সেক্টর ৯ ব্লক বি (Uttara Sector 9 Block B)",
    "উত্তরা সেক্টর ৯ ব্লক সি (Uttara Sector 9 Block C)",
    "উত্তরা সেক্টর ১০ ব্লক এ (Uttara Sector 10 Block A)",
    "উত্তরা সেক্টর ১০ ব্লক বি (Uttara Sector 10 Block B)",
    "উত্তরা সেক্টর ১০ ব্লক সি (Uttara Sector 10 Block C)",
    "উত্তরা সেক্টর ১০ ব্লক ডি (Uttara Sector 10 Block D)",
    "উত্তরা সেক্টর ১১ ব্লক এ (Uttara Sector 11 Block A)",
    "উত্তরা সেক্টর ১১ ব্লক বি (Uttara Sector 11 Block B)",
    "উত্তরা সেক্টর ১১ ব্লক সি (Uttara Sector 11 Block C)",
    "উত্তরা সেক্টর ১১ ব্লক ডি (Uttara Sector 11 Block D)",
    "উত্তরা সেক্টর ১২ ব্লক এ (Uttara Sector 12 Block A)",
    "উত্তরা সেক্টর ১২ ব্লক বি (Uttara Sector 12 Block B)",
    "উত্তরা সেক্টর ১২ ব্লক সি (Uttara Sector 12 Block C)",
    "উত্তরা সেক্টর ১৩ ব্লক এ (Uttara Sector 13 Block A)",
    "উত্তরা সেক্টর ১৩ ব্লক বি (Uttara Sector 13 Block B)",
    "উত্তরা সেক্টর ১৩ ব্লক সি (Uttara Sector 13 Block C)",
    "উত্তরা সেক্টর ১৪ ব্লক এ (Uttara Sector 14 Block A)",
    "উত্তরা সেক্টর ১৪ ব্লক বি (Uttara Sector 14 Block B)",
    "উত্তরা সেক্টর ১৪ ব্লক সি (Uttara Sector 14 Block C)",
    "উত্তরা সেক্টর ১৪ ব্লক ডি (Uttara Sector 14 Block D)",
    "উত্তরা সেক্টর ১৫ ব্লক এ (Uttara Sector 15 Block A)",
    "উত্তরা সেক্টর ১৫ ব্লক বি (Uttara Sector 15 Block B)",
    "উত্তরা সেক্টর ১৫ ব্লক সি (Uttara Sector 15 Block C)",
    "উত্তরা সেক্টর ১৬ ব্লক এ (Uttara Sector 16 Block A)",
    "উত্তরা সেক্টর ১৬ ব্লক বি (Uttara Sector 16 Block B)",
    "উত্তরা সেক্টর ১৭ ব্লক এ (Uttara Sector 17 Block A)",
    "উত্তরা সেক্টর ১৭ ব্লক বি (Uttara Sector 17 Block B)",
    "উত্তরা সেক্টর ১৮ ব্লক এ (Uttara Sector 18 Block A)",
    "উত্তরা সেক্টর ১৮ ব্লক বি (Uttara Sector 18 Block B)",
    "উত্তরা তৃতীয় পর্ব (Uttara 3rd Phase)", "দিয়াবাড়ী (Diabari)",
    "দক্ষিণখান (Dakshinkhan)", "উত্তরখান (Uttarkhan)",
    "ফায়দাবাদ (Faidabad)", "আশকোনা (Ashkona)",
    "আব্দুল্লাহপুর (Abdullahpur)", "তুরাগ (Turag)", "আজমপুর (Azampur)",
    "হাউজ বিল্ডিং (House Building)", "হাজী ক্যাম্প (Haji Camp)",
    "পুরাকরৈ (Purakrai)", "শৈলপুর (Shailpur)", "রানাভোলা (Ranavola)",
    "চামুরখান (Chamurkhan)", "ভাড়িরিয়া (Bhararia)",
    "পলাশিয়া (Palashia)", "ছোট পলাশিয়া (Choto Palashia)",
    "আমাইয়া (Amaiya)", "বড়বাড়ী (Borobari)",
    "কাঁচকুড়া (Kachkura)", "যানঘাটা (Janghata)"
  ],

  "খিলক্ষেত (Khilkhet)": [
    "খিলক্ষেত (Khilkhet)", "খিলক্ষেত বাজার রোড (Khilkhet Bazar Road)",
    "বড় বাজার (Boro Bazar)", "নামাপাড়া (Namapara)",
    "বসুন্ধরা গেইট সংলগ্ন (Bashundhara Gate Area)",
    "নিকুঞ্জ ১ (Nikunja 1)", "নিকুঞ্জ ২ (Nikunja 2)", "নিকুঞ্জ (Nikunja)",
    "এয়ারপোর্ট এলাকা (Airport Area)",
    "তুরাগ নদী সংলগ্ন (Turag River Area)", "কুড়িল (Kuril)",
    "কুড়িল বিশ্বরোড (Kuril Biswaroad)", "কুড়িল চৌরাস্তা (Kuril Chowrasta)",
    "কুড়াতলী (Kuratoli)", "বিশ্বরোড (Biswaroad)",
    "এয়ারপোর্ট রোড (Airport Road)",
    "শাহজালাল আন্তর্জাতিক বিমানবন্দর এলাকা (Hazrat Shahjalal International Airport Area)",
    "জোয়ারসাহারা (Joarsahara)", "অলিপাড়া (Olipara)",
    "জগন্নাথপুর (Jagannathpur)", "টানপাড়া (Tanpara)",
    "খিলক্ষেত তামপাড়া (Khilkhet Tampara)", "নিকুঞ্জ-১ (Nikunja-1)",
    "নিকুঞ্জ-২ (Nikunja-2)",
    "শাহজালাল এয়ারপোর্ট টার্মিনাল ১ (Terminal 1)",
    "শাহজালাল এয়ারপোর্ট টার্মিনাল ২ (Terminal 2)",
    "কুড়িল ফ্লাইওভার এলাকা (Kuril Flyover Area)",
    "কুড়িল আন্ডারপাস এলাকা (Kuril Underpass Area)",
    "প্রগতি সরণি (Progati Sarani)"
  ],

  "ভাটারা (Bhatara)": [
    "ভাটারা (Bhatara)", "নদীপাড়া (Nodipara)",
    "ডিআইটি প্রজেক্ট (DIT Project)", "মেরুল (Merul)",
    "সাঁতারকুল (Satarkul)", "গোটারচর (Gotarchar)",
    "বালুরঘাট (Balurghat)", "চিড়িয়াখানা এলাকা (Chiriakhana Area)",
    "ডাকশিংখান (Dakshinkhan)", "বেড়াইদ (Beraid)", "তালতলা (Taltala)",
    "নুরেরচালা (Nurerchala)", "আবুল হোসেন রোড (Abul Hossain Road)",
    "শাহজাদপুর (Shahjadpur)", "নতুন বাজার (Natun Bazar)",
    "ভাটারা বাজার (Bhatara Bazar)", "ভাটারা মোড় (Bhatara Mor)",
    "ভাটারা ডিআইটি রোড (Bhatara DIT Road)",
    "ভাটারা খিলক্ষেত সংলগ্ন (Bhatara Khilkhet Area)",
    "ভাটারা ব্লক এ (Bhatara Block A)", "ভাটারা ব্লক বি (Bhatara Block B)",
    "ভাটারা ব্লক সি (Bhatara Block C)", "ভাটারা ব্লক ডি (Bhatara Block D)",
    "ভাটারা ব্লক ই (Bhatara Block E)"
  ],

  "বসুন্ধরা (Bashundhara)": [
    "বসুন্ধরা ব্লক এ (Bashundhara Block A)",
    "বসুন্ধরা ব্লক বি (Bashundhara Block B)",
    "বসুন্ধরা ব্লক সি (Bashundhara Block C)",
    "বসুন্ধরা ব্লক ডি (Bashundhara Block D)",
    "বসুন্ধরা ব্লক ই (Bashundhara Block E)",
    "বসুন্ধরা ব্লক এফ (Bashundhara Block F)",
    "বসুন্ধরা ব্লক জি (Bashundhara Block G)",
    "বসুন্ধরা ব্লক এইচ (Bashundhara Block H)",
    "বসুন্ধরা ব্লক আই (Bashundhara Block I)",
    "বসুন্ধরা ব্লক জে (Bashundhara Block J)",
    "বসুন্ধরা ব্লক কে (Bashundhara Block K)",
    "বসুন্ধরা ব্লক এল (Bashundhara Block L)",
    "বসুন্ধরা ব্লক এম (Bashundhara Block M)",
    "বসুন্ধরা ব্লক এন (Bashundhara Block N)",
    "বসুন্ধরা ব্লক ও (Bashundhara Block O)",
    "বসুন্ধরা ব্লক পি (Bashundhara Block P)",
    "বসুন্ধরা ব্লক কিউ (Bashundhara Block Q)",
    "বসুন্ধরা ব্লক আর (Bashundhara Block R)",
    "বসুন্ধরা ব্লক এস (Bashundhara Block S)",
    "বসুন্ধরা আবাসিক এলাকা (Bashundhara Residential Area)",
    "নতুন বাজার (Natun Bazar)", "শাহজাদপুর (Shahjadpur)",
    "জোয়ার Sahara (Joar Sahara)",
    "বসুন্ধরা গেট ১ (Bashundhara Gate 1)",
    "বসুন্ধরা গেট ২ (Bashundhara Gate 2)",
    "বসুন্ধরা গেট ৩ (Bashundhara Gate 3)",
    "বসুন্ধরা গেট ৪ (Bashundhara Gate 4)",
    "বসুন্ধরা সিটি (Bashundhara City)", "বসুন্ধরা আ/এ (Bashundhara R/A)"
  ],

  "বনানী (Banani)": [
    "বনানী রোড ১ (Banani Road 1)", "বনানী রোড ২ (Banani Road 2)",
    "বনানী রোড ৩ (Banani Road 3)", "বনানী রোড ৪ (Banani Road 4)",
    "বনানী রোড ৫ (Banani Road 5)", "বনানী রোড ৬ (Banani Road 6)",
    "বনানী রোড ৭ (Banani Road 7)", "বনানী রোড ৮ (Banani Road 8)",
    "বনানী রোড ৯ (Banani Road 9)", "বনানী রোড ১০ (Banani Road 10)",
    "বনানী রোড ১১ (Banani Road 11)", "বনানী রোড ১২ (Banani Road 12)",
    "বনানী রোড ১৩ (Banani Road 13)", "বনানী রোড ১৪ (Banani Road 14)",
    "বনানী রোড ১৫ (Banani Road 15)", "বনানী রোড ১৬ (Banani Road 16)",
    "বনানী রোড ১৭ (Banani Road 17)", "বনানী রোড ১৮ (Banani Road 18)",
    "বনানী রোড ১৯ (Banani Road 19)", "বনানী রোড ২০ (Banani Road 20)",
    "বনানী রোড ২১ (Banani Road 21)", "বনানী রোড ২২ (Banani Road 22)",
    "বনানী রোড ২৩ (Banani Road 23)", "বনানী রোড ২৪ (Banani Road 24)",
    "বনানী ডিওএইচএস (Banani DOHS)",
    "কামাল আতাতুর্ক এভিনিউ (Kamal Ataturk Avenue)",
    "কাকলী (Kakoli)", "বনানী বাজার (Banani Bazar)",
    "বনানী মহল্লা (Banani Mohalla)",
    "বনানী চেয়ারম্যান বাড়ি এলাকা (Banani Chairman Bari Area)"
  ],

  "গুলশান (Gulshan)": [
    "গুলশান ১ (Gulshan 1)", "গুলশান ২ (Gulshan 2)",
    "নিকেতন (Niketan)", "গুলশান এভিনিউ (Gulshan Avenue)",
    "গুলশান সার্কেল ১ (Gulshan Circle 1)",
    "গুলশান সার্কেল ২ (Gulshan Circle 2)",
    "গুলশান লেক (Gulshan Lake)", "বারিধারা (Baridhara)",
    "বারিধারা ডিওএইচএস (Baridhara DOHS)",
    "বারিধারা জে-ব্লক (Baridhara J-Block)",
    "বারিধারা কে-ব্লক (Baridhara K-Block)",
    "বারিধারা এন-ব্লক (Baridhara N-Block)",
    "বারিধারা ডিপ্লোম্যাটিক জোন (Baridhara Diplomatic Zone)",
    "গুলশান বাজার (Gulshan Bazar)",
    "গুলশান ১ ব্লক এ (Gulshan 1 Block A)",
    "গুলশান ১ ব্লক বি (Gulshan 1 Block B)",
    "গুলশান ১ ব্লক সি (Gulshan 1 Block C)",
    "গুলশান ১ ব্লক ডি (Gulshan 1 Block D)",
    "গুলশান ১ ব্লক ই (Gulshan 1 Block E)",
    "গুলশান ১ ব্লক এফ (Gulshan 1 Block F)",
    "গুলশান ১ ব্লক জি (Gulshan 1 Block G)",
    "গুলশান ২ ব্লক এ (Gulshan 2 Block A)",
    "গুলশান ২ ব্লক বি (Gulshan 2 Block B)",
    "গুলশান ২ ব্লক সি (Gulshan 2 Block C)",
    "গুলশান ২ ব্লক ডি (Gulshan 2 Block D)",
    "গুলশান ২ ব্লক ই (Gulshan 2 Block E)",
    "গুলশান ২ ব্লক এফ (Gulshan 2 Block F)",
    "গুলশান ২ ব্লক জি (Gulshan 2 Block G)",
    "গুলশান ২ ব্লক এইচ (Gulshan 2 Block H)",
    "বারিধারা ব্লক এ (Baridhara Block A)",
    "বারিধারা ব্লক বি (Baridhara Block B)",
    "বারিধারা ব্লক সি (Baridhara Block C)",
    "বারিধারা ব্লক ডি (Baridhara Block D)",
    "বারিধারা ব্লক ই (Baridhara Block E)",
    "বারিধারা ব্লক এফ (Baridhara Block F)",
    "বারিধারা ব্লক জি (Baridhara Block G)",
    "বারিধারা ব্লক এইচ (Baridhara Block H)",
    "বারিধারা ব্লক আই (Baridhara Block I)",
    "বারিধারা ব্লক জে (Baridhara Block J)",
    "বারিধারা ব্লক কে (Baridhara Block K)",
    "বারিধারা ব্লক এল (Baridhara Block L)",
    "বারিধারা ব্লক এম (Baridhara Block M)",
    "বারিধারা ব্লক এন (Baridhara Block N)",
    "গুলশান লেক পার্ক এলাকা (Gulshan Lake Park Area)",
    "গুলশান সোসাইটি এলাকা (Gulshan Society Area)"
  ],

  "মহাখালী (Mohakhali)": [
    "মহাখালী ডিওএইচএস (Mohakhali DOHS)",
    "মহাখালী বাস টার্মিনাল এলাকা (Mohakhali Bus Terminal Area)",
    "ওয়ারলেস গেট (Wireless Gate)",
    "সাততলা বস্তি সংলগ্ন এলাকা (Sattola Area)", "আমতলী (Amtoli)",
    "কোরাইল বস্তি (Korail Slum)", "নাখালপাড়া (Nakhalpara)",
    "পশ্চিম নাখালপাড়া (West Nakhalpara)",
    "পূর্ব নাখালপাড়া (East Nakhalpara)",
    "তেজগাঁও শিল্প এলাকা (Tejgaon Industrial Area)",
    "মহাখালী বাজার (Mohakhali Bazar)",
    "মহাখালী খালপাড় এলাকা (Mohakhali Khalpar Area)",
    "মহাখালী সাততলা (Mohakhali Sattola)",
    "মহাখালী ট্রাক স্ট্যান্ড (Mohakhali Truck Stand)",
    "মহাখালী হাসপাতাল এলাকা (Mohakhali Hospital Area)"
  ],

  "তেজগাঁও (Tejgaon)": [
    "তেজগাঁও শিল্প এলাকা (Tejgaon Industrial Area)",
    "ফার্মগেট (Farmgate)", "কারওয়ান বাজার (Karwan Bazar)",
    "নাখালপাড়া (Nakhalpara)", "সাতরাস্তা (Satrasta)",
    "বেগুনবাড়ী (Begunbari)", "নাবিস্কো (Nabisco)",
    "বিএসটিআই এলাকা (BSTI Area)",
    "তেজগাঁও কলেজ এলাকা (Tejgaon College Area)",
    "তেজগাঁও বাজার (Tejgaon Bazar)",
    "তেজগাঁও রেলগেট এলাকা (Tejgaon Railgate Area)",
    "তেজগাঁও বিমানবন্দর রোড (Tejgaon Airport Road)",
    "নতুন তেজগাঁও (New Tejgaon)", "পুরাতন তেজগাঁও (Old Tejgaon)",
    "তেজগাঁও সরকারি কলোনী (Tejgaon Govt Colony)"
  ],

  "ফার্মগেট (Farmgate)": [
    "ফার্মগেট (Farmgate)", "ফার্মগেট মোড় (Farmgate Mor)",
    "ফার্মগেট বাজার (Farmgate Bazar)",
    "কারওয়ান বাজার (Karwan Bazar)",
    "কৃষি ভবন এলাকা (Krishi Bhaban Area)",
    "বিএসটিআই এলাকা (BSTI Area)",
    "তেজগাঁও কলেজ এলাকা (Tejgaon College Area)",
    "নাবিস্কো এলাকা (Nabisco Area)",
    "বাংলাদেশ কৃষি গবেষণা কাউন্সিল এলাকা (BARC Area)",
    "শেরে বাংলা কৃষি বিশ্ববিদ্যালয় এলাকা (Sher-e-Bangla Agricultural University Area)",
    "ফার্মগেট আন্ডারপাস এলাকা (Farmgate Underpass Area)",
    "ইন্দিরা রোড (Indira Road)", "শাহবাগ (Shahbagh)",
    "কাওরান বাজার (Kawran Bazar)", "তেজগাঁও (Tejgaon)",
    "গ্রিন রোড (Green Road)"
  ],

  "কারওয়ান বাজার (Karwan Bazar)": [
    "কারওয়ান বাজার (Karwan Bazar)",
    "কারওয়ান বাজার মোড় (Karwan Bazar Mor)",
    "কারওয়ান বাজার বাজার (Karwan Bazar Bazar)",
    "কাওরান বাজার রেলগেট (Kawran Bazar Railgate)",
    "বাংলাদেশ টেলিভিশন এলাকা (Bangladesh Television Area)",
    "প্রেস ইনস্টিটিউট এলাকা (Press Institute Area)",
    "কারওয়ান বাজার কমার্শিয়াল এলাকা (Karwan Bazar Commercial Area)",
    "ফার্মগেট (Farmgate)", "তেজগাঁও (Tejgaon)", "শাহবাগ (Shahbagh)",
    "গ্রিন রোড (Green Road)", "পান্থপথ (Panthapath)"
  ],

  "শেরে বাংলা নগর (Sher-e-Bangla Nagar)": [
    "শেরে বাংলা নগর (Sher-e-Bangla Nagar)",
    "জাতীয় সংসদ ভবন এলাকা (National Parliament Area)",
    "টেকনিক্যাল এলাকা (Technical Area)",
    "কৃষি গবেষণা এলাকা (Agricultural Research Area)",
    "খামারবাড়ি (Khamarbari)", "মিরপুর রোড (Mirpur Road)",
    "মানিক মিয়া এভিনিউ (Manik Mia Avenue)",
    "জাতীয় ক্রীড়া পরিষদ এলাকা (National Sports Council Area)",
    "শেরে বাংলা নগর থানা এলাকা (Sher-e-Bangla Nagar Thana Area)"
  ],

  "আগারগাঁও (Agargaon)": [
    "আগারগাঁও (Agargaon)", "আগারগাঁও মোড় (Agargaon Mor)",
    "আগারগাঁও বাজার (Agargaon Bazar)",
    "আগারগাঁও সরকারি কলোনী (Agargaon Govt Colony)",
    "বাংলাদেশ সচিবালয় এলাকা (Bangladesh Secretariat Area)",
    "সরকারি কর্মচারী হাসপাতাল এলাকা (Govt Employees Hospital Area)",
    "আগারগাঁও আইসিটি টাওয়ার এলাকা (Agargaon ICT Tower Area)",
    "ব্যবস্থাপনা উন্নয়ন ইনস্টিটিউট এলাকা (Management Development Institute Area)",
    "পরিকল্পনা কমিশন এলাকা (Planning Commission Area)",
    "শেরে বাংলা নগর (Sher-e-Bangla Nagar)",
    "মিরপুর রোড (Mirpur Road)", "শ্যামলী (Shyamoli)",
    "কল্যাণপুর (Kallyanpur)", "আদাবর (Adabor)"
  ],

  "কল্যাণপুর (Kallyanpur)": [
    "কল্যাণপুর (Kallyanpur)",
    "কল্যাণপুর বাস স্ট্যান্ড (Kallyanpur Bus Stand)",
    "কল্যাণপুর বাজার (Kallyanpur Bazar)",
    "পশ্চিম কল্যাণপুর (West Kallyanpur)",
    "পূর্ব কল্যাণপুর (East Kallyanpur)",
    "কল্যাণপুর হাউজিং (Kallyanpur Housing)",
    "কল্যাণপুর রেলগেট এলাকা (Kallyanpur Railgate Area)",
    "বুড়িরটেক (Burirtek)", "মিরপুর রোড (Mirpur Road)",
    "শ্যামলী (Shyamoli)", "আগারগাঁও (Agargaon)",
    "আদাবর (Adabor)", "মোহাম্মদপুর (Mohammadpur)"
  ],

  "আদাবর (Adabor)": [
    "আদাবর (Adabor)", "আদাবর মোড় (Adabor Mor)",
    "আদাবর বাজার (Adabor Bazar)", "আদাবর হাউজিং (Adabor Housing)",
    "আদাবর স্কুল রোড (Adabor School Road)",
    "আদাবর কলেজ রোড (Adabor College Road)",
    "শ্যামলী (Shyamoli)", "মোহাম্মদপুর (Mohammadpur)",
    "কল্যাণপুর (Kallyanpur)", "মিরপুর রোড (Mirpur Road)",
    "সোবহানবাগ (Sobhanbagh)", "ধানমন্ডি (Dhanmondi)",
    "আদাবর থানা এলাকা (Adabor Thana Area)",
    "আদাবর ব্লক এ (Adabor Block A)",
    "আদাবর ব্লক বি (Adabor Block B)",
    "আদাবর ব্লক সি (Adabor Block C)",
    "আদাবর ব্লক ডি (Adabor Block D)"
  ],

  "শ্যামলী (Shyamoli)": [
    "শ্যামলী (Shyamoli)", "শ্যামলী মোড় (Shyamoli Mor)",
    "শ্যামলী বাজার (Shyamoli Bazar)",
    "শ্যামলী হাউজিং (Shyamoli Housing)",
    "শ্যামলী হাউজিং এস্টেট (Shyamoli Housing Estate)",
    "শ্যামলী ব্লক এ (Shyamoli Block A)",
    "শ্যামলী ব্লক বি (Shyamoli Block B)",
    "শ্যামলী ব্লক সি (Shyamoli Block C)",
    "শ্যামলী ব্লক ডি (Shyamoli Block D)",
    "শ্যামলী ব্লক ই (Shyamoli Block E)",
    "শ্যামলী ব্লক এফ (Shyamoli Block F)",
    "শ্যামলী রোড ১ (Shyamoli Road 1)", "শ্যামলী রোড ২ (Shyamoli Road 2)",
    "শ্যামলী রোড ৩ (Shyamoli Road 3)", "শ্যামলী রোড ৪ (Shyamoli Road 4)",
    "শ্যামলী রোড ৫ (Shyamoli Road 5)", "শ্যামলী রোড ৬ (Shyamoli Road 6)",
    "শ্যামলী রোড ৭ (Shyamoli Road 7)", "শ্যামলী রোড ৮ (Shyamoli Road 8)",
    "শ্যামলী রোড ৯ (Shyamoli Road 9)", "শ্যামলী রোড ১০ (Shyamoli Road 10)",
    "শ্যামলী স্কুল রোড (Shyamoli School Road)",
    "শ্যামলী কলেজ রোড (Shyamoli College Road)",
    "শ্যামলী মিরপুর রোড (Shyamoli Mirpur Road)",
    "শ্যামলী চাঁদ উদ্যান (Shyamoli Chand Udyan)",
    "শ্যামলী কবরস্থান এলাকা (Shyamoli Graveyard Area)",
    "শ্যামলী বুদ্ধিজীবী কবরস্থান (Shyamoli Intellectuals Graveyard)",
    "শ্যামলী আসাদ গেট (Shyamoli Asad Gate)",
    "শ্যামলী বাবর রোড (Shyamoli Babar Road)",
    "শ্যামলী পশ্চিম (West Shyamoli)",
    "শ্যামলী পূর্ব (East Shyamoli)",
    "শ্যামলী উত্তর (North Shyamoli)",
    "শ্যামলী দক্ষিণ (South Shyamoli)"
  ],

  "ক্যান্টনমেন্ট (Cantonment)": [
    "ঢাকা ক্যান্টনমেন্ট (Dhaka Cantonment)", "ভাষানটেক (Bhashantec)",
    "মানিকদী (Manikdi)", "ইসিবি চত্বর (ECB Chattar)",
    "ক্যান্টনমেন্ট বাজার (Cantonment Bazar)", "মহাখালী (Mohakhali)",
    "বনানী (Banani)", "গুলশান (Gulshan)", "বাড্ডা (Badda)",
    "মাটিকাটা (Matikata)", "বলধা (Baldha)",
    "ক্যান্টনমেন্ট রোড (Cantonment Road)",
    "ঢাকা সেনানিবাস (Dhaka Senanibas)",
    "সেনানিবাস বাজার (Senanibas Bazar)",
    "সেনা হাসপাতাল এলাকা (Combined Military Hospital Area)",
    "ক্যান্টনমেন্ট পাবলিক স্কুল এলাকা (Cantonment Public School Area)"
  ],

  "বাড্ডা (Badda)": [
    "উত্তর বাড্ডা (North Badda)", "মধ্য বাড্ডা (Madhya Badda)",
    "দক্ষিণ বাড্ডা (South Badda)", "পূর্ব বাড্ডা (East Badda)",
    "পশ্চিম বাড্ডা (West Badda)", "মেরুল বাড্ডা (Merul Badda)",
    "সাঁতারকুল রোড (Satarkul Road)", "গ্রেটার রোড (Greater Road)",
    "বাড্ডা ডিআইটি প্রজেক্ট (Badda DIT Project)",
    "আফতাবনগর (Aftabnagar)", "সাতারকুল (Satarkul)",
    "বেড়াইদ (Beraid)", "শাহজাদপুর (Shahjadpur)",
    "আদর্শনগর (Adarshanagar)", "মধুবাগ (Madhubag)",
    "বাড্ডা বাজার (Badda Bazar)",
    "বাড্ডা থানা এলাকা (Badda Thana Area)",
    "বাড্ডা লিংক রোড (Badda Link Road)",
    "বাড্ডা ডিআইটি রোড (Badda DIT Road)",
    "হোসেন মার্কেট এলাকা (Hosen Market Area)",
    "বাড্ডা নদীপাড়া (Badda Nodipara)",
    "বাড্ডা কুড়িল সংলগ্ন (Badda Kuril Area)"
  ],

  "রামপুরা (Rampura)": [
    "পূর্ব রামপুরা (East Rampura)", "পশ্চিম রামপুরা (West Rampura)",
    "উত্তর রামপুরা (North Rampura)", "দক্ষিণ রামপুরা (South Rampura)",
    "নতুন রামপুরা (New Rampura)", "উলন রোড (Ulon Road)",
    "হাজীপাড়া (Hajipara)",
    "টেলিফোন এক্সচেঞ্জ রোড (Telephone Exchange Road)",
    "মহাখালী কানেক্টিং রোড সংলগ্ন (Connecting Area)",
    "পলাশবাগ (Polashbag)", "মেরাদিয়া (Meradia)",
    "ডিআইটি রোড (DIT Road)", "কুঞ্জবন (Kunjobon)",
    "শান্তিবাগ (Santibag)", "ওয়াপদা রোড (Wapda Road)",
    "রামপুরা বাজার (Rampura Bazar)",
    "রামপুরা ব্রিজ এলাকা (Rampura Bridge Area)",
    "রামপুরা থানা এলাকা (Rampura Thana Area)",
    "রামপুরা বনশ্রী সংলগ্ন (Rampura Banasree Area)",
    "রামপুরা মেরাদিয়া (Rampura Meradia)",
    "রামপুরা কুঞ্জবন (Rampura Kunjobon)"
  ],

  "বনশ্রী (Banasree)": [
    "বনশ্রী ব্লক এ (Banasree Block A)",
    "বনশ্রী ব্লক বি (Banasree Block B)",
    "বনশ্রী ব্লক সি (Banasree Block C)",
    "বনশ্রী ব্লক ডি (Banasree Block D)",
    "বনশ্রী ব্লক ই (Banasree Block E)",
    "বনশ্রী ব্লক এফ (Banasree Block F)",
    "বনশ্রী ব্লক জি (Banasree Block G)",
    "বনশ্রী ব্লক এইচ (Banasree Block H)",
    "বনশ্রী মেইন রোড (Banasree Main Road)",
    "বনশ্রী ডিআইটি রোড (Banasree DIT Road)",
    "বনশ্রী বাজার (Banasree Bazar)",
    "বনশ্রী হাউজিং (Banasree Housing)",
    "বনশ্রী থানা এলাকা (Banasree Thana Area)",
    "বনশ্রী ব্লক এ রোড ১ (Banasree Block A Road 1)",
    "বনশ্রী ব্লক বি রোড ১ (Banasree Block B Road 1)",
    "বনশ্রী ব্লক সি রোড ১ (Banasree Block C Road 1)"
  ],

  "আফতাবনগর (Aftabnagar)": [
    "আফতাবনগর ব্লক এ (Aftabnagar Block A)",
    "আফতাবনগর ব্লক বি (Aftabnagar Block B)",
    "আফতাবনগর ব্লক সি (Aftabnagar Block C)",
    "আফতাবনগর ব্লক ডি (Aftabnagar Block D)",
    "আফতাবনগর ব্লক ই (Aftabnagar Block E)",
    "আফতাবনগর ব্লক এফ (Aftabnagar Block F)",
    "আফতাবনগর ব্লক জি (Aftabnagar Block G)",
    "আফতাবনগর মেইন রোড (Aftabnagar Main Road)",
    "আফতাবনগর বাজার (Aftabnagar Bazar)",
    "আফতাবনগর হাউজিং (Aftabnagar Housing)",
    "পূর্ব আফতাবনগর (East Aftabnagar)",
    "পশ্চিম আফতাবনগর (West Aftabnagar)",
    "আফতাবনগর লেক এলাকা (Aftabnagar Lake Area)",
    "আফতাবনগর থানা এলাকা (Aftabnagar Thana Area)"
  ],

  "হাতিরঝিল (Hatirjheel)": [
    "হাতিরঝিল (Hatirjheel)", "হাতিরঝিল লেক (Hatirjheel Lake)",
    "রামপুরা ব্রিজ (Rampura Bridge)", "বেগুনবাড়ী (Begunbari)",
    "নন্দীপাড়া (Nandipara)", "মেরুল বাড্ডা (Merul Badda)",
    "গোড়ান (Goran)", "চিথলিয়া (Chitholia)",
    "দক্ষিণগাঁও (Dakshingaon)",
    "হাতিরঝিল প্রজেক্ট এলাকা (Hatirjheel Project Area)",
    "হাতিরঝিল এক্সপ্রেসওয়ে (Hatirjheel Expressway)",
    "বনশ্রী সংলগ্ন এলাকা (Banasree Area)",
    "হাতিরঝিল থানা এলাকা (Hatirjheel Thana Area)",
    "হাতিরঝিল ব্রিজ এলাকা (Hatirjheel Bridge Area)"
  ],

  "মগবাজার (Moghbazar)": [
    "মগবাজার চৌরাস্তা (Moghbazar Chowrasta)",
    "নিউ ইস্কাটন (New Eskaton)", "পুরাতন ইস্কাটন (Old Eskaton)",
    "মধুবাগ (Madhubag)", "গাবতলা মগবাজার (Gabtala Moghbazar)",
    "মালিবাগ (Malibagh)", "শান্তিনগর (Shantinagar)",
    "কাকরাইল (Kakrail)", "বেইলি রোড (Bailey Road)",
    "সিদ্ধেশ্বরী (Siddheswari)", "নয়াটোলা (Noyatola)",
    "রাজাবাজার (Rajabazar)", "মগবাজার বাজার (Moghbazar Bazar)",
    "মগবাজার থানা এলাকা (Moghbazar Thana Area)",
    "মগবাজার ওয়্যারলেস এলাকা (Moghbazar Wireless Area)",
    "মগবাজার রেলগেট এলাকা (Moghbazar Railgate Area)"
  ],

  // ═══════════════════════════════════════════════════════════
  // ঢাকা দক্ষিণ সিটি কর্পোরেশন (DSCC)
  // ═══════════════════════════════════════════════════════════

  "ধানমন্ডি (Dhanmondi)": [
    "ধানমন্ডি রোড ১ (Dhanmondi Road 1)", "ধানমন্ডি রোড ২ (Dhanmondi Road 2)",
    "ধানমন্ডি রোড ৩ (Dhanmondi Road 3)", "ধানমন্ডি রোড ৪ (Dhanmondi Road 4)",
    "ধানমন্ডি রোড ৫ (Dhanmondi Road 5)", "ধানমন্ডি রোড ৬ (Dhanmondi Road 6)",
    "ধানমন্ডি রোড ৭ (Dhanmondi Road 7)", "ধানমন্ডি রোড ৮ (Dhanmondi Road 8)",
    "ধানমন্ডি রোড ৯ (Dhanmondi Road 9)", "ধানমন্ডি রোড ১০ (Dhanmondi Road 10)",
    "ধানমন্ডি রোড ১১ (Dhanmondi Road 11)", "ধানমন্ডি রোড ১২ (Dhanmondi Road 12)",
    "ধানমন্ডি রোড ১৩ (Dhanmondi Road 13)", "ধানমন্ডি রোড ১৪ (Dhanmondi Road 14)",
    "ধানমন্ডি রোড ১৫ (Dhanmondi Road 15)", "ধানমন্ডি রোড ১৬ (Dhanmondi Road 16)",
    "ধানমন্ডি রোড ১৭ (Dhanmondi Road 17)", "ধানমন্ডি রোড ১৮ (Dhanmondi Road 18)",
    "ধানমন্ডি রোড ১৯ (Dhanmondi Road 19)", "ধানমন্ডি রোড ২০ (Dhanmondi Road 20)",
    "ধানমন্ডি রোড ২১ (Dhanmondi Road 21)", "ধানমন্ডি রোড ২২ (Dhanmondi Road 22)",
    "ধানমন্ডি রোড ২৩ (Dhanmondi Road 23)", "ধানমন্ডি রোড ২৪ (Dhanmondi Road 24)",
    "ধানমন্ডি রোড ২৫ (Dhanmondi Road 25)", "ধানমন্ডি রোড ২৬ (Dhanmondi Road 26)",
    "ধানমন্ডি রোড ২৭ (Dhanmondi Road 27)", "ধানমন্ডি রোড ২৮ (Dhanmondi Road 28)",
    "ধানমন্ডি রোড ২৯ (Dhanmondi Road 29)", "ধানমন্ডি রোড ৩০ (Dhanmondi Road 30)",
    "ধানমন্ডি রোড ৩১ (Dhanmondi Road 31)", "ধানমন্ডি রোড ৩২ (Dhanmondi Road 32)",
    "ধানমন্ডি আ/এ (Dhanmondi A/A)", "ধানমন্ডি বাজার (Dhanmondi Bazar)",
    "ধানমন্ডি লেক এলাকা (Dhanmondi Lake Area)",
    "শেরেবাংলা রোড (Sher-e-Bangla Road)",
    "মিতালী রোড (Mitali Road)",
    "হাজী আফসারুদ্দীন রোড (Haji Afsaruddin Road)",
    "হাতেমবাগ (Hatem Bagh)", "লোক সার্কাস (Lok Circus)",
    "উত্তর ধানমন্ডি (North Dhanmondi)",
    "দক্ষিণ ধানমন্ডি (South Dhanmondi)",
    "পশ্চিম ধানমন্ডি (West Dhanmondi)",
    "পূর্ব ধানমন্ডি (East Dhanmondi)",
    "ধানমন্ডি হাউজিং (Dhanmondi Housing)",
    "ধানমন্ডি প্রজেক্ট এলাকা (Dhanmondi Project Area)",
    "ধানমন্ডি থানা এলাকা (Dhanmondi Thana Area)",
    "সাত মসজিদ রোড (Sat Masjid Road)", "জিগাতলা (Zigatola)",
    "শংকর (Shankar)", "সোবহানবাগ (Sobhanbagh)",
    "কলাবাগান (Kalabagan)", "ধানমন্ডি ২৭ (Dhanmondi 27)",
    "ধানমন্ডি ৩২ (Dhanmondi 32)", "ধানমন্ডি ১৫ (Dhanmondi 15)",
    "ধানমন্ডি ৮/এ (Dhanmondi 8/A)", "ধানমন্ডি ৯/এ (Dhanmondi 9/A)",
    "ধানমন্ডি ১১/এ (Dhanmondi 11/A)", "ধানমন্ডি ১২/এ (Dhanmondi 12/A)",
    "ধানমন্ডি ১৩/এ (Dhanmondi 13/A)"
  ],

  "লালমাটিয়া (Lalmatia)": [
    "লালমাটিয়া (Lalmatia)", "লালমাটিয়া ব্লক এ (Lalmatia Block A)",
    "লালমাটিয়া ব্লক বি (Lalmatia Block B)",
    "লালমাটিয়া ব্লক সি (Lalmatia Block C)",
    "লালমাটিয়া ব্লক ডি (Lalmatia Block D)",
    "লালমাটিয়া ব্লক ই (Lalmatia Block E)",
    "লালমাটিয়া ব্লক এফ (Lalmatia Block F)",
    "লালমাটিয়া ব্লক জি (Lalmatia Block G)",
    "লালমাটিয়া ব্লক এইচ (Lalmatia Block H)",
    "লালমাটিয়া মোড় (Lalmatia Mor)",
    "লালমাটিয়া বাজার (Lalmatia Bazar)",
    "ধানমন্ডি (Dhanmondi)", "মোহাম্মদপুর (Mohammadpur)",
    "সাত মসজিদ রোড (Sat Masjid Road)",
    "মিরপুর রোড (Mirpur Road)", "কলাবাগান (Kalabagan)",
    "লালমাটিয়া থানা এলাকা (Lalmatia Thana Area)"
  ],

  "মোহাম্মদপুর (Mohammadpur)": [
    "মোহাম্মদপুর টাউন হল (Mohammadpur Town Hall)",
    "বছিলা (Boshila)", "শিয়া মসজিদ (Shia Mosque)",
    "নুরজাহান রোড (Nurjahan Road)",
    "সলিমুল্লাহ রোড (Salimullah Road)",
    "জাপানি বাজার (Japani Bazar)", "বসিলা (Bosila)",
    "মোহাম্মদপুর বাস স্ট্যান্ড (Mohammadpur Bus Stand)",
    "জেনেভা ক্যাম্প (Geneva Camp)",
    "নবোদয় হাউজিং (Navodaya Housing)",
    "চাঁদ উদ্যান (Chand Udyan)", "ঢাকা উদ্যান (Dhaka Udyan)",
    "শানিরবিল (Shanirbil)", "শেখের টেক (Sheikher Tek)",
    "গাইদার টেক (Gaidar Tek)",
    "মোহাম্মদপুর হাউজিং (Mohammadpur Housing)",
    "মোহাম্মদপুর বাজার (Mohammadpur Bazar)",
    "তালতলা (Taltala)",
    "মোহাম্মদপুর হাউজিং এস্টেট (Mohammadpur Housing Estate)",
    "পশ্চিম মোহাম্মদপুর (West Mohammadpur)",
    "পূর্ব মোহাম্মদপুর (East Mohammadpur)",
    "উত্তর মোহাম্মদপুর (North Mohammadpur)",
    "দক্ষিণ মোহাম্মদপুর (South Mohammadpur)",
    "মোহাম্মদপুর থানা এলাকা (Mohammadpur Thana Area)",
    "মোহাম্মদপুর ব্লক এ (Mohammadpur Block A)",
    "মোহাম্মদপুর ব্লক বি (Mohammadpur Block B)",
    "মোহাম্মদপুর ব্লক সি (Mohammadpur Block C)",
    "মোহাম্মদপুর ব্লক ডি (Mohammadpur Block D)",
    "মোহাম্মদপুর ব্লক ই (Mohammadpur Block E)",
    "মোহাম্মদপুর ব্লক এফ (Mohammadpur Block F)",
    "মোহাম্মদপুর ব্লক জি (Mohammadpur Block G)",
    "মোহাম্মদপুর ব্লক এইচ (Mohammadpur Block H)"
  ],

  "কাটাসুর (Katasur)": [
    "কাটাসুর (Katasur)", "কাটাসুর বাজার (Katasur Bazar)",
    "কাটাসুর মোড় (Katasur Mor)", "কাটাসুর রোড (Katasur Road)",
    "মোহাম্মদপুর (Mohammadpur)", "আদাবর (Adabor)",
    "শ্যামলী (Shyamoli)", "ধানমন্ডি (Dhanmondi)",
    "মিরপুর রোড (Mirpur Road)"
  ],

  "বসিলা (Bosila)": [
    "বসিলা (Bosila)", "বসিলা বাজার (Bosila Bazar)",
    "বসিলা হাউজিং (Bosila Housing)",
    "বসিলা ব্রিজ এলাকা (Bosila Bridge Area)",
    "মোহাম্মদপুর (Mohammadpur)", "আদাবর (Adabor)",
    "রায়ের বাজার (Rayer Bazar)", "হাজারীবাগ (Hazaribagh)"
  ],

  "রায়ের বাজার (Rayer Bazar)": [
    "রায়ের বাজার (Rayer Bazar)",
    "রায়ের বাজার বধ্যভূমি এলাকা (Rayer Bazar Killing Field Area)",
    "রায়ের বাজার ব্রিজ এলাকা (Rayer Bazar Bridge Area)",
    "রায়ের বাজার বাজার (Rayer Bazar Bazar)",
    "মোহাম্মদপুর (Mohammadpur)", "ধানমন্ডি (Dhanmondi)",
    "হাজারীবাগ (Hazaribagh)", "কামরাঙ্গীরচর (Kamrangirchar)"
  ],

  "গ্রিন রোড (Green Road)": [
    "গ্রিন রোড (Green Road)", "গ্রিন রোড মোড় (Green Road Mor)",
    "গ্রিন রোড বাজার (Green Road Bazar)", "পান্থপথ (Panthapath)",
    "ফার্মগেট (Farmgate)", "ধানমন্ডি (Dhanmondi)",
    "কলাবাগান (Kalabagan)", "কাটাবন (Katabon)",
    "নিউমার্কেট (New Market)", "শাহবাগ (Shahbagh)",
    "গ্রিন রোড থানা এলাকা (Green Road Thana Area)"
  ],

  "পান্থপথ (Panthapath)": [
    "পান্থপথ (Panthapath)", "পান্থপথ মোড় (Panthapath Mor)",
    "পান্থপথ বাজার (Panthapath Bazar)", "গ্রিন রোড (Green Road)",
    "ফার্মগেট (Farmgate)", "ধানমন্ডি (Dhanmondi)",
    "কলাবাগান (Kalabagan)", "কাটাবন (Katabon)",
    "নিউমার্কেট (New Market)", "শাহবাগ (Shahbagh)",
    "সোবহানবাগ (Sobhanbagh)", "হাতিরপুল (Hatirpool)",
    "পান্থপথ থানা এলাকা (Panthapath Thana Area)"
  ],

  "হাতিরপুল (Hatirpool)": [
    "হাতিরপুল (Hatirpool)", "হাতিরপুল মোড় (Hatirpool Mor)",
    "হাতিরপুল বাজার (Hatirpool Bazar)", "নীলক্ষেত (Nilkhet)",
    "নিউমার্কেট (New Market)", "শাহবাগ (Shahbagh)",
    "বাংলামোটর (Banglamotor)", "সেগুনবাগিচা (Segunbagicha)",
    "কাকরাইল (Kakrail)", "পান্থপথ (Panthapath)",
    "গ্রিন রোড (Green Road)", "এলিফ্যান্ট রোড (Elephant Road)",
    "হাতিরপুল থানা এলাকা (Hatirpool Thana Area)"
  ],

  "কলাবাগান (Kalabagan)": [
    "কলাবাগান (Kalabagan)", "কলাবাগান মোড় (Kalabagan Mor)",
    "কলাবাগান বাজার (Kalabagan Bazar)", "ধানমন্ডি (Dhanmondi)",
    "লালমাটিয়া (Lalmatia)", "গ্রিন রোড (Green Road)",
    "পান্থপথ (Panthapath)", "হাতিরপুল (Hatirpool)",
    "নিউমার্কেট (New Market)", "শাহবাগ (Shahbagh)",
    "সোবহানবাগ (Sobhanbagh)",
    "কলাবাগান থানা এলাকা (Kalabagan Thana Area)"
  ],

  "নিউমার্কেট (New Market)": [
    "নিউমার্কেট (New Market)", "নীলক্ষেত (Nilkhet)",
    "আজিমপুর (Azimpur)", "ফার্মগেট (Farmgate)",
    "কাটাবন (Katabon)", "শাহবাগ (Shahbagh)",
    "এলিফ্যান্ট রোড (Elephant Road)",
    "নিউ এলিফ্যান্ট রোড (New Elephant Road)",
    "পুরাতন এলিফ্যান্ট রোড (Old Elephant Road)",
    "বাবুপুরা (Babupura)", "ইডেন কলেজ এলাকা (Eden College Area)",
    "নিউমার্কেট বাজার (New Market Bazar)",
    "নীলক্ষেত বাজার (Nilkhet Bazar)",
    "আজিমপুর বাজার (Azimpur Bazar)", "পলাশী (Palashi)",
    "ঢাকা কলেজ (Dhaka College)",
    "সাইন্স ল্যাবরেটরী (Science Laboratory)",
    "সেন্টাল রোড (Central Road)",
    "আইয়ুব আলী কলোনী (Ayub Ali Colony)",
    "বাংলাদেশ-কুয়েত মৈত্রী হল (Bangladesh-Kuwait Maitree Hall)",
    "সমাজ কল্যান ও গবেষণা ইনষ্টিটিউট (Social Welfare and Research Institute)",
    "নিউমার্কেট থানা এলাকা (New Market Thana Area)"
  ],

  "শাহবাগ (Shahbagh)": [
    "শাহবাগ (Shahbagh)", "শাহবাগ মোড় (Shahbagh Mor)",
    "মৎস্য ভবন এলাকা (Fisheries Bhaban Area)",
    "বাংলা একাডেমি এলাকা (Bangla Academy Area)",
    "ঢাকা বিশ্ববিদ্যালয় এলাকা (Dhaka University Area)",
    "সুপ্রিম কোর্ট এলাকা (Supreme Court Area)",
    "কাকরাইল (Kakrail)", "সেগুনবাগিচা (Segunbagicha)",
    "পল্টন (Paltan)", "বাংলামোটর (Banglamotor)",
    "টি.এস.সি. এলাকা (TSC Area)",
    "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় এলাকা (BSMMU Area)",
    "ঢাকা মেডিকেল কলেজ এলাকা (Dhaka Medical College Area)",
    "শাহবাগ থানা এলাকা (Shahbagh Thana Area)",
    "শাহবাগ আন্তর্জাতিক কনফারেন্স সেন্টার এলাকা (Shahbagh International Conference Center Area)"
  ],

  "পল্টন (Paltan)": [
    "পল্টন (Paltan)", "গুলিস্তান (Gulistan)",
    "বাংলাবাজার (Banglabazar)",
    "স্টেডিয়াম মার্কেট এলাকা (Stadium Market Area)",
    "বিজয়নগর (Bijoynagar)",
    "প্রেস ক্লাব এলাকা (Press Club Area)",
    "মতিঝিল (Motijheel)", "দিলকুশা (Dilkusha)",
    "টয়েনবি সার্কুলার রোড (Toyenbee Circular Road)",
    "নয়াপল্টন (Naya Paltan)", "পুরানা পল্টন (Purana Paltan)",
    "গুলিস্তান মোড় (Gulistan Mor)",
    "পল্টন থানা এলাকা (Paltan Thana Area)"
  ],

  "মতিঝিল (Motijheel)": [
    "মতিঝিল শাপলা চত্বর (Shapla Chattar)",
    "দিলকুশা (Dilkusha)",
    "পীরজঙ্গি মাজার রোড (Pirjungi Mazar Road)",
    "আরামবাগ (Arambagh)", "ফকিরাপুল (Fakirapool)",
    "বাপ্টিস্ট মিশন রোড (Baptist Mission Road)",
    "রাজারবাগ (Rajarbagh)", "কমলাপুর (Kamalapur)",
    "শাহজাহানপুর (Shahjahanpur)", "মুগদা (Mugda)",
    "সবুজবাগ (Sabujbagh)", "বাসাবো (Basabo)", "গোরান (Goran)",
    "মতিঝিল বাণিজ্যিক এলাকা (Motijheel Commercial Area)",
    "দিলকুশা বাণিজ্যিক এলাকা (Dilkusha Commercial Area)",
    "ফকিরাপুল বাজার এলাকা (Fakirapool Bazar Area)",
    "মতিঝিল সি/এ (Motijheel C/A)", "দিলকুশা সি/এ (Dilkusha C/A)",
    "বঙ্গবন্ধু এভিনিউ (Bangabandhu Avenue)",
    "মতিঝিল থানা এলাকা (Motijheel Thana Area)",
    "আব্দুল হামিদ রোড (Abdul Hamid Road)",
    "ইস্পাহানি রোড (Ispahani Road)",
    "নবাবপুর রোড (Nawabpur Road)",
    "পীরজঙ্গি মাজার এলাকা (Pirjungi Mazar Area)"
  ],

  "লালবাগ (Lalbagh)": [
    "লালবাগ কেল্লা এলাকা (Lalbagh Fort Area)", "পোস্তা (Posta)",
    "আজিমপুর (Azimpur)", "বক্সনগর (Box Nagar)",
    "উর্দু রোড (Urdu Road)", "দেওয়ান বাজার (Dewan Bazar)",
    "চকবাজার (Chawkbazar)", "বংশাল (Bangshal)",
    "সদরঘাট (Sadarghat)", "নবাবপুর (Nawabpur)",
    "ইসলামপুর (Islampur)", "মিতফোর্ড (Mitford)",
    "বাবুবাজার (Babu Bazar)", "নাজিরাবাজার (Nazira Bazar)",
    "হোসেনী দালান রোড (Hosaini Dalan Road)",
    "অরফালেজ রোড (Orphanage Road)",
    "কমল দাহ রোড (Kamal Daha Road)",
    "গিরদা উর্দু রোড (Girda Urdu Road)",
    "জয়নাগ রোড (Joynagar Road)",
    "বকশী বাজার রোড (Bakshi Bazar Road)",
    "লালবাগ রোড (Lalbagh Road)",
    "হাজারীবাগ রোড (Hazaribagh Road)", "লবাগ রোড (Labagh Road)",
    "লালবাগ থানা এলাকা (Lalbagh Thana Area)"
  ],

  "কোতোয়ালি (Kotwali)": [
    "কোতোয়ালি (Kotwali)", "আহসান মঞ্জিল (Ahsan Manzil)",
    "চকবাজার (Chawkbazar)", "নয়াবাজার (Naya Bazar)",
    "মৌলভীবাজার (Moulvibazar)", "কলতাবাজার (Kaltabazar)",
    "বংশাল (Bangshal)", "সদরঘাট (Sadarghat)",
    "ইসলামপুর (Islampur)", "মিতফোর্ড (Mitford)",
    "বাবুবাজার (Babu Bazar)",
    "বুড়িগঙ্গা নদী সংলগ্ন এলাকা (Buriganga River Area)",
    "সদরঘাট লঞ্চ টার্মিনাল এলাকা (Sadarghat Launch Terminal Area)",
    "কোতোয়ালি থানা এলাকা (Kotwali Thana Area)"
  ],

  "ওয়ারী (Wari)": [
    "ওয়ারী (Wari)", "র্যাংকিন স্ট্রিট (Rankin Street)",
    "লক্ষণ সাহা স্ট্রিট (Laxman Saha Street)",
    "জয়কালী মন্দির (Joykali Temple Area)",
    "রোজ গার্ডেন সংলগ্ন (Rose Garden Area)",
    "টিপরা বাজার (Tipra Bazar)", "নারিন্দা (Narinda)",
    "টিকাটুলি (Tikatuli)", "গেন্ডারিয়া (Gendaria)",
    "সূত্রাপুর (Sutrapur)", "ধোলাইখাল (Dholaikhal)",
    "ফরিদাবাদ (Faridabad)", "শ্যামপুর (Shyampur)",
    "কদমতলী (Kadamtali)", "জুরাইন (Jurain)",
    "আরমানিটোলা (Armanitola)", "বাংলাবাজার (Banglabazar)",
    "হাটখোলা রোড (Hatkhola Road)", "মিশন রোড (Mission Road)",
    "রবতী মোহন দাস রোড (Raboti Mohan Das Road)",
    "হরিচরণ রায় রোড (Haricharan Ray Road)",
    "ফরাশগঞ্জ লেন (Farashganj Lane)",
    "ফরাশগঞ্জ রোড (Farashganj Road)", "উলিঙ্গল (Ulingal)",
    "ওয়ারী থানা এলাকা (Wari Thana Area)",
    "ওয়ারী বাজার (Wari Bazar)"
  ],

  "সূত্রাপুর (Sutrapur)": [
    "সূত্রাপুর (Sutrapur)", "নারিন্দা (Narinda)",
    "গেন্ডারিয়া (Gendaria)", "ধোলাইখাল (Dholaikhal)",
    "ফরিদাবাদ (Faridabad)", "মতিঝিল (Motijheel)",
    "শ্যামপুর (Shyampur)", "কদমতলী (Kadamtali)",
    "জুরাইন (Jurain)", "বাবুবাজার (Babu Bazar)",
    "সূত্রাপুর থানা এলাকা (Sutrapur Thana Area)"
  ],

  "গেন্ডারিয়া (Gendaria)": [
    "গেন্ডারিয়া (Gendaria)", "ধোলাইখাল (Dholaikhal)",
    "নারিন্দা (Narinda)", "টিকাটুলি (Tikatuli)",
    "শ্যামপুর (Shyampur)", "কদমতলী (Kadamtali)",
    "ফরিদাবাদ (Faridabad)", "জুরাইন (Jurain)",
    "গেন্ডারিয়া থানা এলাকা (Gendaria Thana Area)"
  ],

  "যাত্রাবাড়ী (Jatrabari)": [
    "যাত্রাবাড়ী চৌরাস্তা (Jatrabari Chowrasta)",
    "জনপদ মোড় (Jonapad Mor)", "দয়াগঞ্জ (Dayaganj)",
    "কোনারপাড়া (Konapara)", "ধলপুর (Dhalpur)",
    "শল্লা (Shalla)", "সায়েদাবাদ (Sayedabad)",
    "জুরাইন (Jurain)", "কদমতলী (Kadamtali)",
    "শ্যামপুর (Shyampur)", "মাতুয়াইল (Matuail)",
    "শনির আখড়া (Shanir Akhra)", "দনিয়া (Donia)",
    "সারুলিয়া (Sarulia)",
    "যাত্রাবাড়ী থানা এলাকা (Jatrabari Thana Area)",
    "যাত্রাবাড়ী বাজার (Jatrabari Bazar)",
    "দয়াগঞ্জ থানা এলাকা (Dayaganj Thana Area)"
  ],

  "ডেমরা (Demra)": [
    "ডেমরা (Demra)", "শনির আখড়া (Shanir Akhra)",
    "দনিয়া (Donia)", "সারুলিয়া (Sarulia)",
    "মাতুয়াইল (Matuail)", "কদমতলী (Kadamtali)",
    "জুরাইন (Jurain)", "ধলপুর (Dhalpur)",
    "শ্যামপুর (Shyampur)", "স্টাফ কোয়ার্টার (Staff Quarter)",
    "বামৈল (Bamail)", "ডেমরা থানা এলাকা (Demra Thana Area)",
    "ডেমরা বাজার (Demra Bazar)"
  ],

  "কদমতলী (Kadamtali)": [
    "কদমতলী (Kadamtali)", "শ্যামপুর (Shyampur)",
    "জুরাইন (Jurain)", "মাতুয়াইল (Matuail)",
    "ধলপুর (Dhalpur)", "শনির আখড়া (Shanir Akhra)",
    "দনিয়া (Donia)", "সারুলিয়া (Sarulia)", "ডেমরা (Demra)",
    "কদমতলী থানা এলাকা (Kadamtali Thana Area)"
  ],

  "শ্যামপুর (Shyampur)": [
    "শ্যামপুর (Shyampur)", "কদমতলী (Kadamtali)",
    "জুরাইন (Jurain)", "মাতুয়াইল (Matuail)",
    "ধলপুর (Dhalpur)", "ফরিদাবাদ (Faridabad)",
    "গেন্ডারিয়া (Gendaria)", "নারিন্দা (Narinda)",
    "শ্যামপুর থানা এলাকা (Shyampur Thana Area)"
  ],

  "খিলগাঁও (Khilgaon)": [
    "খিলগাঁও রেলগেট (Khilgaon Railgate)",
    "খিলগাঁও বাজার (Khilgaon Bazar)",
    "খিলগাঁও টি-ব্লক (Khilgaon T-Block)",
    "খিলগাঁও সি-ব্লক (Khilgaon C-Block)",
    "খিলগাঁও ডি-ব্লক (Khilgaon D-Block)",
    "খিলগাঁও ই-ব্লক (Khilgaon E-Block)",
    "খিলগাঁও এফ-ব্লক (Khilgaon F-Block)",
    "খিলগাঁও জি-ব্লক (Khilgaon G-Block)",
    "খিলগাঁও এইচ-ব্লক (Khilgaon H-Block)",
    "তিলপাপাড়া (Tilpapara)", "মেরাদিয়া (Meradia)",
    "গোড়ান (Goran)", "নন্দীপাড়া (Nandipara)",
    "মাদারটেক (Madartek)", "মালিবাগ (Malibagh)",
    "হাজীপাড়া (Hajipara)", "পূর্ব বাসাবো (East Basabo)",
    "পশ্চিম বাসাবো (West Basabo)",
    "উত্তর বাসাবো (North Basabo)",
    "দক্ষিণ বাসাবো (South Basabo)",
    "মাদারটেক বাজার (Madartek Bazar)",
    "নন্দীপাড়া বাজার (Nandipara Bazar)",
    "মেরাদিয়া বাজার (Meradia Bazar)",
    "গোড়ান বাজার (Goran Bazar)",
    "খিলগাঁও থানা এলাকা (Khilgaon Thana Area)"
  ],

  "মুগদা (Mugda)": [
    "মুগদা (Mugda)", "মুগদা হাসপাতাল এলাকা (Mugda Hospital Area)",
    "মুগদা বাজার (Mugda Bazar)",
    "মুগদা ডিআইটি প্রজেক্ট (Mugda DIT Project)",
    "মুগদা কলেজ এলাকা (Mugda College Area)",
    "বাসাবো (Basabo)", "সবুজবাগ (Sabujbagh)",
    "গোড়ান (Goran)", "খিলগাঁও (Khilgaon)",
    "মালিবাগ (Malibagh)", "শাহজাহানপুর (Shahjahanpur)",
    "মুগদা থানা এলাকা (Mugda Thana Area)"
  ],

  "সবুজবাগ (Sabujbagh)": [
    "সবুজবাগ (Sabujbagh)", "সবুজবাগ বাজার (Sabujbagh Bazar)",
    "পূর্ব সবুজবাগ (East Sabujbagh)",
    "পশ্চিম সবুজবাগ (West Sabujbagh)",
    "উত্তর সবুজবাগ (North Sabujbagh)",
    "দক্ষিণ সবুজবাগ (South Sabujbagh)",
    "বাসাবো (Basabo)", "গোড়ান (Goran)", "মুগদা (Mugda)",
    "খিলগাঁও (Khilgaon)", "মালিবাগ (Malibagh)",
    "শাহজাহানপুর (Shahjahanpur)", "কমলাপুর (Kamalapur)",
    "সবুজবাগ থানা এলাকা (Sabujbagh Thana Area)"
  ],

  "শাহজাহানপুর (Shahjahanpur)": [
    "শাহজাহানপুর (Shahjahanpur)",
    "শাহজাহানপুর বাজার (Shahjahanpur Bazar)",
    "রাজারবাগ (Rajarbagh)", "কমলাপুর (Kamalapur)",
    "মুগদা (Mugda)", "বাসাবো (Basabo)",
    "সবুজবাগ (Sabujbagh)", "খিলগাঁও (Khilgaon)",
    "মালিবাগ (Malibagh)", "টিকাটুলি (Tikatuli)",
    "শাহজাহানপুর থানা এলাকা (Shahjahanpur Thana Area)"
  ],

  "কমলাপুর (Kamalapur)": [
    "কমলাপুর (Kamalapur)",
    "কমলাপুর রেলস্টেশন (Kamalapur Railway Station)",
    "বঙ্গবন্ধু জাতীয় স্টেডিয়াম এলাকা (National Stadium Area)",
    "সায়েদাবাদ (Sayedabad)", "রাজারবাগ (Rajarbagh)",
    "শাহজাহানপুর (Shahjahanpur)", "টিকাটুলি (Tikatuli)",
    "কমলাপুর বাজার (Kamalapur Bazar)",
    "কমলাপুর থানা এলাকা (Kamalapur Thana Area)"
  ],

  "হাজারীবাগ (Hazaribagh)": [
    "হাজারীবাগ (Hazaribagh)",
    "হাজারীবাগ থানা এলাকা (Hazaribagh Thana Area)",
    "হাজারীবাগ বাজার (Hazaribagh Bazar)",
    "হাজারীবাগ রোড (Hazaribagh Road)",
    "লবাগ রোড (Labagh Road)", "রায়ের বাজার (Rayer Bazar)",
    "কামরাঙ্গীরচর (Kamrangirchar)"
  ],

  "কামরাঙ্গীরচর (Kamrangirchar)": [
    "কামরাঙ্গীরচর (Kamrangirchar)",
    "কামরাঙ্গীরচর বাজার (Kamrangirchar Bazar)",
    "কামরাঙ্গীরচর হাউজিং (Kamrangirchar Housing)",
    "কামরাঙ্গীরচর কলোনী (Kamrangirchar Colony)",
    "বুড়িগঙ্গা নদী সংলগ্ন এলাকা (Buriganga River Area)",
    "হাজারীবাগ (Hazaribagh)", "রায়ের বাজার (Rayer Bazar)"
  ],

  "রায়েরবাগ (Rayerbagh)": [
    "রায়েরবাগ বাস স্ট্যান্ড (Rayerbagh Bus Stand)",
    "দক্ষিণ রায়েরবাগ (South Rayerbagh)",
    "পূর্ব রায়েরবাগ (East Rayerbagh)",
    "রায়েরবাগ বাজার (Rayerbagh Bazar)",
    "রায়েরবাগ হাউজিং (Rayerbagh Housing)",
    "হাজারীবাগ (Hazaribagh)", "কামরাঙ্গীরচর (Kamrangirchar)"
  ],

  "পুরান ঢাকা (Old Dhaka)": [
    "আহসান মঞ্জিল (Ahsan Manzil)", "লালবাগ কেল্লা (Lalbagh Fort)",
    "চকবাজার (Chawkbazar)", "বংশাল (Bangshal)",
    "সদরঘাট (Sadarghat)", "নারিন্দা (Narinda)",
    "টিকাটুলি (Tikatuli)", "গেন্ডারিয়া (Gendaria)",
    "সূত্রাপুর (Sutrapur)", "ওয়ারী (Wari)",
    "ইসলামপুর (Islampur)", "নবাবপুর (Nawabpur)",
    "নাজিরাবাজার (Nazira Bazar)", "মিতফোর্ড (Mitford)",
    "বাবুবাজার (Babu Bazar)", "পোস্তা (Posta)",
    "উর্দু রোড (Urdu Road)", "দেওয়ান বাজার (Dewan Bazar)",
    "হাজারীবাগ (Hazaribagh)", "কামরাঙ্গীরচর (Kamrangirchar)",
    "ফরিদাবাদ (Faridabad)", "শ্যামপুর (Shyampur)",
    "কদমতলী (Kadamtali)", "আরমানিটোলা (Armanitola)",
    "বাংলাবাজার (Banglabazar)", "নয়াবাজার (Naya Bazar)",
    "মৌলভীবাজার (Moulvibazar)", "কলতাবাজার (Kaltabazar)",
    "হাটখোলা (Hatkhola)", "মিশন রোড (Mission Road)",
    "রবতী মোহন দাস রোড (Raboti Mohan Das Road)",
    "হরিচরণ রায় রোড (Haricharan Ray Road)",
    "শ্যামা প্রসাদ চৌধুরী লেন (Shyama Prasad Chowdhury Lane)",
    "রূপালা দাস লেন (Rupala Das Lane)",
    "পাতাখান লেন (Patakhan Lane)",
    "ফরাশগঞ্জ লেন (Farashganj Lane)",
    "ফরাশগঞ্জ রোড (Farashganj Road)", "উলিঙ্গল (Ulingal)",
    "টয়েনবি সার্কুলার রোড (Toyenbee Circular Road)",
    "ভগবতী ব্যানাজী রোড (Bhagabati Banerjee Road)",
    "হোসেনী দালান রোড (Hosaini Dalan Road)",
    "অরফালেজ রোড (Orphanage Road)",
    "কমল দাহ রোড (Kamal Daha Road)",
    "গিরদা উর্দু রোড (Girda Urdu Road)",
    "জয়নাগ রোড (Joynagar Road)",
    "বকশী বাজার রোড (Bakshi Bazar Road)",
    "লালবাগ রোড (Lalbagh Road)",
    "হাজারীবাগ রোড (Hazaribagh Road)",
    "লবাগ রোড (Labagh Road)"
  ],

  // ═══════════════════════════════════════════════════════════
  // ঢাকা জেলার উপজেলা (বৃহত্তর ঢাকা)
  // ═══════════════════════════════════════════════════════════

  "সাভার (Savar)": [
    "সাভার সদর (Savar Sadar)", "সাভার বাজার রোড (Savar Bazar Road)",
    "সাভার ক্যান্টনমেন্ট (Savar Cantonment)", "গেন্ডা (Genda)",
    "হেমায়েতপুর (Hemayetpur)", "আশুলিয়া (Ashulia)",
    "বাইপাইল (Baipail)", "জিরাবো (Zirabo)",
    "আমিন বাজার (Amin Bazar)", "ধামসোনা (Dhamsana)",
    "পাথালিয়া (Pathalia)", "বনগাঁও (Banagram)",
    "বিরুলিয়া (Biralia)", "ভাকুর্তা (Bhakurta)",
    "শিমুলিয়া (Shimulia)", "ইয়ারপুর (Yearpur)",
    "কাউন্দিয়া (Kaundia)", "তেঁতুলঝোড়া (Tetuljhora)",
    "নবীনগর (Nabinagar)", "কাঠগড়া (Kathgora)",
    "বলিয়ারপুর (Boliarpur)", "চেরাগআলী (Cheragali)",
    "নর্দ্দানা (Nardana)", "ভাড়ারবাড়ি (Bhararbari)",
    "কুন্ডু (Kundu)", "শহীদ স্মৃতি (Shahid Smriti)",
    "ভগ্নিপুর (Bhagnipur)", "পাঁচবাগ (Panchbagh)",
    "ভাদাইল (Bhadail)", "শীতলপুর (Shitalpur)",
    "সাভার পৌরসভা (Savar Municipality)",
    "সাভার বাজার (Savar Bazar)", "আশুলিয়া বাজার (Ashulia Bazar)",
    "সাভার থানা এলাকা (Savar Thana Area)",
    "আশুলিয়া থানা এলাকা (Ashulia Thana Area)"
  ],

  "কেরানীগঞ্জ (Keraniganj)": [
    "কেরানীগঞ্জ সদর (Keraniganj Sadar)", "আগরপুর (Agerpur)",
    "জিনজিরা (Zinjira)", "শুভাঢ্যা (Shubhadhya)",
    "কালীগঞ্জ কেরানীগঞ্জ (Kaliganj Keraniganj)",
    "হজরতপুর (Hazratpur)", "হাসনাবাদ (Hasnabad)",
    "তেঘরিয়া (Tegharia)", "ঝিলমিল (Jhilmil)",
    "রুহিতপুর (Ruhitpur)", "বাস্তা (Basta)",
    "কালিন্দী (Kalindi)", "সাক্তা (Sakta)",
    "তরণগর (Taranagar)", "কলাতিয়া (Kalatia)",
    "সুভাঢ্যা (Suvadda)", "টাঘোরিয়া (Taghoria)",
    "কোন্ডা (Konda)", "আগানগর (Aganagar)",
    "চুংকুটিয়া (Chunkutia)", "কদমতলী (Kadamtali)",
    "দক্ষিণ কেরানীগঞ্জ (South Keraniganj)",
    "কেরানীগঞ্জ মডেল থানা (Keraniganj Model Thana)",
    "সুবলদিয়া (Subaldia)", "বাহ্রা (Bahra)", "নয়াবাদ (Nayabad)",
    "কেরানীগঞ্জ পৌরসভা (Keraniganj Municipality)"
  ],

  "ধামরাই (Dhamrai)": [
    "ধামরাই সদর (Dhamrai Sadar)", "আমতা (Amta)",
    "কুশুরা (Kushura)", "গাঙ্গুটিয়া (Gangutia)",
    "সূতিপাড়া (Sutipara)", "ভাড়ারিয়া (Bhararia)",
    "বালিয়া (Balia)", "নান্নার (Nannar)", "কুল্লা (Kulla)",
    "যাদবপুর (Jadabpur)", "সুয়াপুর (Suapur)",
    "সানোড়া (Sanora)", "চৌহাট (Chouhat)",
    "বাইশাকান্দা (Baishakanda)", "সোমভাগ (Sombhag)",
    "রোয়াইল (Rowail)", "বালিয়াটি (Baliatee)",
    "কলামপুর (Kalampur)", "ধামরাই পৌরসভা (Dhamrai Municipality)"
  ],

  "দোহার (Dohar)": [
    "দোহার সদর (Dohar Sadar)", "মাহমুদপুর (Mahmudpur)",
    "কুসুমহাটি (Kusumhati)", "নয়াবাড়ী (Nayabari)",
    "বিলাসপুর (Bilaspur)", "মুন্সীকান্দি (Munshikandi)",
    "রাইপাড়া (Raipara)", "সূতারপাড়া (Sutarpara)",
    "নারিশা (Narisha)", "মুকসুদপুর (Muksudpur)",
    "দোহার পৌরসভা (Dohar Municipality)"
  ],

  "নবাবগঞ্জ (Nawabganj)": [
    "নবাবগঞ্জ সদর (Nawabganj Sadar)", "আগলা (Agla)",
    "বান্দুরা (Bandura)", "চুড়াইন (Churain)",
    "দীঘিরপাড় (Dighirpar)", "কলাকোপা (Kalakopa)",
    "শিকারীপাড়া (Shikaripara)", "জয়কৃষ্ণপুর (Joykrishnapur)",
    "বারুয়াখালী (Baruakhali)", "গালিমপুর (Galimpur)",
    "কৈলাইল (Kailail)", "বক্সনগর (Boxnagar)",
    "শোলস্না (Sholla)", "নয়নশ্রী (Noyonshree)",
    "বাহ্রা (Bara)", "যন্ত্রাইল (Jantrail)",
    "নবাবগঞ্জ পৌরসভা (Nawabganj Municipality)"
  ],

  // ═══════════════════════════════════════════════════════════
  // পার্শ্ববর্তী জেলা (বৃহত্তর ঢাকা)
  // ═══════════════════════════════════════════════════════════

  "গাজীপুর (Gazipur)": [
    "গাজীপুর সদর (Gazipur Sadar)", "টঙ্গী (Tongi)",
    "জয়দেবপুর (Joydebpur)", "কালিয়াকৈর (Kaliakair)",
    "শ্রীপুর (Sreepur)", "কালীগঞ্জ (Kaliganj)",
    "কাপাসিয়া (Kapasia)", "বাসন (Basan)", "গাছা (Gachha)",
    "কোনাবাড়ী (Konabari)", "পুবাইল (Pubail)",
    "কাশিমপুর (Kashimpur)", "কায়েতলিয়া (Kayaltia)",
    "বোর্ড বাজার (Board Bazar)",
    "চান্দনা চৌরাস্তা (Chandana Chowrasta)", "সালনা (Salna)",
    "ভোগড়া (Bhogora)", "নাওজোর (Naowjor)",
    "টঙ্গী বাজার (Tongi Bazar)",
    "স্টেশন রোড টঙ্গী (Station Road Tongi)",
    "আউচপাড়া (Auchpara)", "এরশাদ নগর (Ershad Nagar)",
    "মিলগেট (Millgate)", "মির্জাপুর (Mirzapur)",
    "কাউলতিয়া (Kaultia)", "ভাওয়াল গড় (Bhawal Gar)",
    "পিরুজালী (Pirujali)", "বাড়ীয়া (Baria)",
    "ফুলবাড়ীয়া (Fulbaria)", "চাপাইর (Chapair)",
    "বোয়ালী (Boali)", "মৌচাক (Mouchak)",
    "শ্রীফলতলী (Srifaltali)", "সূত্রাপুর (Sutrapur)",
    "আটাবহ (Atabaha)", "মধ্যপাড়া (Madhyapara)",
    "ঢালজোড়া (Dhaljora)", "তুমুলিয়া (Tumulia)",
    "মোক্তারপুর (Moktarpur)", "নাগরী (Nagari)",
    "বক্তারপুর (Baktarpur)", "জাঙ্গালিয়া (Jangalia)",
    "বাহাদুরশাদী (Bahadurshadi)", "জামালপুর (Jamalpur)",
    "তরগাঁও (Targaon)", "রায়েদ (Rayed)",
    "সিংহশ্রী (Singhasree)", "বারিষাব (Barishab)",
    "টোক (Tok)", "কড়িহাতা (Karihata)",
    "সন্মানিয়া (Sanmania)", "ঘাগটিয়া (Ghagtia)",
    "দূর্গাপুর (Durgapur)", "চাঁদপুর (Chandpur)",
    "মাওনা (Mawna)", "তেলিহাটী (Telihati)",
    "বরমী (Barmi)", "কাওরাইদ (Kawraid)",
    "গোসিংগা (Gosinga)", "রাজাবাড়ী (Rajabari)",
    "প্রহলাদপুর (Prahladpur)",
    "গাজীপুর পৌরসভা (Gazipur Municipality)",
    "টঙ্গী পৌরসভা (Tongi Municipality)"
  ],

  "নারায়ণগঞ্জ (Narayanganj)": [
    "নারায়ণগঞ্জ সদর (Narayanganj Sadar)", "চাষাড়া (Chashara)",
    "বন্দর (Bandar)", "সিদ্ধিরগঞ্জ (Siddhirganj)",
    "ফতুল্লা (Fatullah)", "আড়াইহাজার (Araihazar)",
    "সোনারগাঁ (Sonargaon)", "রূপগঞ্জ (Rupganj)",
    "কাঁচপুর (Kanchanpur)", "মদনগঞ্জ (Madanganj)",
    "আদমজী (Adamjee)", "গোদনাইল (Godnail)",
    "এনায়েতনগর (Enayetnagar)", "আলীরটেক (Alirtek)",
    "কাশিপুর (Kashipur)", "কুতুবপুর (Kutubpur)",
    "গোগনগর (Gognagar)", "বক্তাবলী (Baktabali)",
    "সাতগ্রাম (Satgram)", "দুপ্তারা (Duphtara)",
    "ব্রাক্ষন্দী (Brakhondi)", "ফতেপুর (Fatepur)",
    "বিশনন্দী (Bishnandi)", "মাহমুদপুর (Mahmudpur)",
    "হাইজাদী (Haizadi)", "উচিৎপুরা (Uchitpura)",
    "কালাপাহাড়িয়া (Kalapaharia)", "খাদকান্দা (Khadakanda)",
    "মুছাপুর (Musapur)", "মদনপুর (Madanpur)",
    "ধামগড় (Dhamgar)", "কলাগাছিয়া (Kalagachia)",
    "মুড়াপাড়া (Murapada)", "ভুলতা (Bhulta)",
    "গোলাকান্দাইল (Golakandail)", "দাউদপুর (Daudpur)",
    "কায়েতপাড়া (Kayetpara)", "ভোলাব (Bholab)",
    "পিরোজপুর (Pirojpur)", "শম্ভুপুরা (Shambhupura)",
    "মোগরাপাড়া (Mograpara)", "বৈদ্যেরবাজার (Baidyerbazar)",
    "বারদী (Bardi)", "নোয়াগাঁও (Noagaon)",
    "জামপুর (Jampur)", "সাদিপুর (Sadipur)",
    "সনমান্দি (Sanmandi)",
    "নারায়ণগঞ্জ পৌরসভা (Narayanganj Municipality)",
    "সিদ্ধিরগঞ্জ পৌরসভা (Siddhirganj Municipality)"
  ],

  "পূর্বাচল (Purbachal)": [
    "পূর্বাচল আবাসিক মডেল টাউন (Purbachal Residential Model Town)",
    "পূর্বাচল নতুন শহর (Purbachal New Town)",
    "পূর্বাচল সেক্টর ১ (Purbachal Sector 1)",
    "পূর্বাচল সেক্টর ২ (Purbachal Sector 2)",
    "পূর্বাচল সেক্টর ৩ (Purbachal Sector 3)",
    "পূর্বাচল সেক্টর ৪ (Purbachal Sector 4)",
    "পূর্বাচল সেক্টর ৫ (Purbachal Sector 5)",
    "পূর্বাচল সেক্টর ৬ (Purbachal Sector 6)",
    "পূর্বাচল সেক্টর ৭ (Purbachal Sector 7)",
    "পূর্বাচল সেক্টর ৮ (Purbachal Sector 8)",
    "পূর্বাচল সেক্টর ৯ (Purbachal Sector 9)",
    "পূর্বাচল সেক্টর ১০ (Purbachal Sector 10)",
    "পূর্বাচল সেক্টর ১১ (Purbachal Sector 11)",
    "পূর্বাচল সেক্টর ১২ (Purbachal Sector 12)",
    "পূর্বাচল সেক্টর ১৩ (Purbachal Sector 13)",
    "পূর্বাচল সেক্টর ১৪ (Purbachal Sector 14)",
    "পূর্বাচল সেক্টর ১৫ (Purbachal Sector 15)",
    "পূর্বাচল সেক্টর ১৬ (Purbachal Sector 16)",
    "পূর্বাচল সেক্টর ১৭ (Purbachal Sector 17)",
    "পূর্বাচল সেক্টর ১৮ (Purbachal Sector 18)",
    "পূর্বাচল সেক্টর ১৯ (Purbachal Sector 19)",
    "পূর্বাচল সেক্টর ২০ (Purbachal Sector 20)",
    "পূর্বাচল সেক্টর ২১ (Purbachal Sector 21)",
    "পূর্বাচল সেক্টর ২২ (Purbachal Sector 22)",
    "পূর্বাচল সেক্টর ২৩ (Purbachal Sector 23)",
    "পূর্বাচল সেক্টর ২৪ (Purbachal Sector 24)",
    "পূর্বাচল সেক্টর ২৫ (Purbachal Sector 25)",
    "পূর্বাচল সেক্টর ২৬ (Purbachal Sector 26)",
    "পূর্বাচল সেক্টর ২৭ (Purbachal Sector 27)",
    "পূর্বাচল সেক্টর ২৮ (Purbachal Sector 28)",
    "পূর্বাচল সেক্টর ২৯ (Purbachal Sector 29)",
    "পূর্বাচল সেক্টর ৩০ (Purbachal Sector 30)",
    "পূর্বাচল বাজার (Purbachal Bazar)",
    "পূর্বাচল লেক এলাকা (Purbachal Lake Area)",
    "পূর্বাচল গলফ ক্লাব এলাকা (Purbachal Golf Club Area)"
  ]
};

// Helper to normalize strings for comparison (removes parens, spaces, lowercases)
const normalizeLoc = (str: string) => str ? str.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]/g, '') : '';

// Get all Dhaka zone names
export const getDhakaZones = (): string[] => Object.keys(dhakaFullLocations);

// Find matching zone in Dhaka
export const findDhakaZone = (query: string): string | undefined => {
  if (!query) return undefined;
  const nQuery = normalizeLoc(query);
  return Object.keys(dhakaFullLocations).find(zone => {
    const nZone = normalizeLoc(zone);
    return nZone === nQuery || nZone.includes(nQuery) || nQuery.includes(nZone);
  });
};

// Get sub-locations for a given zone or upazila name
export const getDhakaSubLocations = (zoneOrUpazila?: string): string[] => {
  if (!zoneOrUpazila) {
    const all = new Set<string>();
    Object.values(dhakaFullLocations).forEach(list => list.forEach(loc => all.add(loc)));
    return Array.from(all);
  }
  const matchedKey = findDhakaZone(zoneOrUpazila);
  if (matchedKey && dhakaFullLocations[matchedKey]) {
    return dhakaFullLocations[matchedKey];
  }
  const nQuery = normalizeLoc(zoneOrUpazila);
  const matchedLists: string[] = [];
  Object.entries(dhakaFullLocations).forEach(([key, list]) => {
    if (normalizeLoc(key).includes(nQuery) || nQuery.includes(normalizeLoc(key))) {
      matchedLists.push(...list);
    }
  });
  if (matchedLists.length > 0) {
    return Array.from(new Set(matchedLists));
  }
  const all = new Set<string>();
  Object.values(dhakaFullLocations).forEach(list => list.forEach(loc => all.add(loc)));
  return Array.from(all);
};

export { dhakaFullLocations };
export default dhakaFullLocations;

