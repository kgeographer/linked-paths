var d3 = Object.assign({}, require("d3"), require("d3-scale"));

window.d3time = function() {
    'use strict';
  const element = document.getElementById('tl');
  const data = [{
      label: 'Name',
      data: [{
          type: TimelineChart.TYPE.POINT,
          at: new Date([2015, 1, 11])
      }, {
          type: TimelineChart.TYPE.POINT,
          at: new Date([2015, 1, 15])
      }, {
          type: TimelineChart.TYPE.POINT,
          at: new Date([2015, 3, 10])
      }, {
          label: 'I\'m a label',
          type: TimelineChart.TYPE.INTERVAL,
          from: new Date([2015, 2, 1]),
          to: new Date([2015, 3, 1])
      }, {
          type: TimelineChart.TYPE.POINT,
          at: new Date([2015, 6, 1])
      }, {
          type: TimelineChart.TYPE.POINT,
          at: new Date([2015, 7, 1]),
          customClass: 'custom-class'
      }]
  }];

  const timeline = new TimelineChart(element, data, {
      tip: function(d) {
          return d.at || `${d.from}<br>${d.to}`;
      }
  });
}

window.makeTimeVis = function(){
  // DOM element where the Timeline will be attached
  var container = document.getElementById('tl');
  // Configuration for the Timeline
  var options = {
    autoResize: 'false',
    margin: {
      axis: 8,
      item: {
        vertical: 4
      }
    }
    // margin.item.vertical: 24
  };

  // Create a DataSet (allows two way data-binding)
  var items = new vis.DataSet([
    {"id": 1, "end": "0629-1-31", "descr": "At the age of 27 Xuanzang left Chang'an (modern day Xian) China on a 16 year pilgrimage to India in search of original Buddhist texts and scriptures in the year 629 C.E. Chang'an was the capital of the Tang Dynasty at the time. The Tang Dynasty Emperor Taizong had made an imperial decree restricting travel outside China. Emperor Taizong was not sympathetic to Buddhists at the time, so Xuanzang had to begin his journey in the dead of night. In 645 C.E. when Xuanzang returned, he became a confidant and advisor to Emperor Taizong. He also became one of the most revered Chinese legendary figures. His legend extends into Buddhism, art, literary fields, and as a cultural figure. Xuanzang's pilgrimage also highlights the important role the Silk Road played in the diffusion of more than goods", "start": "0629-01-01", "content": "Chang'an-Liangzhou"},
    {"id": 2, "end": "0629-2-31", "descr": "", "start": "0629-02-01", "content": "Liangzhou - An-hsi"},
    {"id": 3, "end": "0629-3-31", "descr": "Xuanzang aquired supplies in An-hsi for the next leg of his trip, a 200 mile journey though the Gobi Desert to the oasis town of Hami.", "start": "0629-03-01", "content": "An-hsi - Jade Gate"},
    {"id": 4, "end": "0629-4-31", "descr": "Xuanzang had some troubles getting past the watchtowers in this region (See Episode 2). He had aquired a companion named Bandha who was supposed to help guide him past the Jade Gate.", "start": "0629-04-01", "content": "Jae Gate - Hami"},
    {"id": 5, "end": "0629-5-31", "descr": "From Hami Xuanzang was escorted to Turfan by a an envoy sent by the King of Turfan who had heard of his approach. Oasis towns like Hami, stationed along the Silk Road, were the places that acted as relay stations for the spread of religion, as well as goods on the Silk Road.", "start": "0629-05-01", "content": "Hami-Turfan"},
    {"id": 6, "end": "0630-12-31", "descr": "Xuanzang and his caravan were confronted by bandits after crossing the Qoltag Mountains while travelling towards Karashahr. They were able to bribe the bandits into doing them no harm.", "start": "0630-01-01", "content": "Turfan-Karashahr"},
    {"id": 7, "end": "0630-12-31", "descr": "After a 200 mile journey from Turfan, Xuanzang's caravan reached Karashahr (modern day Yanqi). Here he noted ten monasteries containing nearly 2,000 Buddhist monks. The monks were of the Hinayana school of Buddhism. he only stayed in Karashahr for one night before continuing on.", "start": "0630-01-01", "content": "Karashahr-Kucha"},
    {"id": 8, "end": "0630-12-31", "descr": "Xuanzang travelled to Kucha after leaving Karasharh. Xuanzang and his caravan of travelers experienced what many other travelers often experienced on the Silk Road: bandits. Yet again, he and his caravan were met by a band of about 2,000 Turkish bandits two days out of Kucha. They gave Xuanzang's caravan no trouble, and the caravan eventually reached Aksu. The routes on the Silk Road connecting strings of oasis towns were prime locations for bandits. Travelers and merchants could not traverse the middle of the desert, or stay in the mountains, so they were forced to take the routes using each oasis to resupply. Bandits knew this, and took advantage of the geography of the Silk Road in regions where it was advantageous to them.", "start": "0630-01-01", "content": "Kucha-Aksu"},
    {"id": 9, "end": "0630-12-31", "descr": "After losing one third of his caravan in his seven day trek across the Tien Shan Mountains on the Bedal Pass, Xuanzang made it to Tokmak, where the Great Khan of the Western Turks was staying.", "start": "0630-01-01", "content": "Aksu-Tokmak"},
    {"id": 10, "end": "0630-12-31", "descr": "Between Tokmak and Tashkent Xuanzang crossed the area known as the land of ten thousand springs. The area is lush, with many springs, rivers, streams lending to its vibrant aray of trees, shrubs and grasses.", "start": "0630-01-01", "content": "Tokmak-Tashkent"},
    {"id": 11, "end": "0630-12-31", "descr": "", "start": "0630-01-01", "content": "Tashkent-Samarkand"},
    {"id": 12, "end": "0630-12-31", "descr": "", "start": "0630-01-01", "content": "Samarkand-Kunduz"},
    {"id": 13, "end": "0630-12-31", "descr": "", "start": "0630-01-01", "content": "Kunduz-Balkh"},
    {"id": 14, "end": "0630-12-31", "descr": "After struggling greatly through the snowy Hindu Kush mountains, Xuanzang and his company reached the Bamiyan Valley. There were 10 monasteries and several thousand monks belonging to Hinayana Buddhism. The king met him as he entered the city, where Xuanzang noted the heavy clothing and fur the people wore to protect themselves from the cold. It is here that Xuanzang encountered the giant Buddhas carved into the cliff walls and described them in his narrative. The descriptions may have served for some giant sculptures of Buddhas in China that were built after Xuanzang's return. Xuanzang stayed in Bamiyan for a month before continuing on towards Kapisi.", "start": "0630-01-01", "content": "Balkh-Bamiyan"},
    {"id": 15, "end": "0630-12-31", "descr": "After nearly being lost in a snowstorm in the Black Mountains, Xuanzang luckily finds some hunters who guide him to Kapisi. There were 100 monasteries and over 6,000 Mayahanist Buddhist monks. Xuanzang took part of a five day religious assembly, much like a debate, which revealed that he had mastered nealry all the schools of Buddhism, not just his own. Kapisi is the first stop on his journey where he meets Jains and Hindus.", "start": "0630-01-01", "content": "Bamiyan-Kapisi"},
    {"id": 16, "end": "0630-12-31", "descr": "", "start": "0630-01-01", "content": "Kapisi-Nagarahara"},
    {"id": 17, "end": "0630-12-31", "descr": "Xuanzang traversed the Khyber Pass to reach Peshawar, this time he did not meet with bandits or harsh weather. He noted that the city was fairly desolate, with maybe one thousand families living in one corner of the city. He does find the area rich in Buddhist lore, and sites. There were once around 1,000 Buddhist monasteries, all empty and in ruins at the time of his visit. he also found many stupas in ruin. In Peshawar he noted about 100 Hindu temples, an example of how religion was changing in this area. Xuanzang visited several places associated with Buddhist legends, including a Pipal tree.", "start": "0630-01-01", "content": "Nagarahara-Peshawar"},
    {"id": 18, "end": "0630-12-31", "descr": "Xuanzang detours through Charsadda to visit a Stupa commemorating a Buddhist story in which Buddha gives his eyes for charity.", "start": "0630-01-01", "content": "Pehawar-Charsadda"},
    {"id": 19, "end": "0630-12-31", "descr": "", "start": "0630-01-01", "content": "Charsadda-Shabaz Gharhi"},
    {"id": 20, "end": "0630-12-31", "descr": "", "start": "0630-01-01", "content": "Shabaz Gharhi-Darel"},
    {"id": 21, "end": "0630-12-31", "descr": "Xuanzang detoured from the direct route to India to head up the Swat valley, where 18,000 monks had once lived. During his pilgrimage he found very many monks, as Buddhism was in a state of decline in all of India. Xuanzang collected several Sutras while in the area.He eventually retraced his steps back down the valley and continued on toward Attock.", "start": "0630-01-01", "content": "Darel-Attock"},
    {"id": 22, "end": "0630-12-31", "descr": "Xuanzang crossed the Indus river somewhere near Attock. Xuanzang mentions those trying to leave India carrying precious Indian goods would capsize in the river. Its stream is extremely clear and rapid. Poisonous dragons and evil spirits dwell beneath this river in great numbers. Those who cross this river carrying with them rare gems of India, or celebrated flowers, or Sariras, the boat is suddenly overwhelmed by the waves. Hwui Li", "start": "0630-01-01", "content": "Attock-Taxila"},
    {"id": 23, "end": "0630-12-31", "descr": "", "start": "0630-01-01", "content": "Taxila-Shrinigar"},
    {"id": 24, "end": "0633-12-31", "descr": "", "start": "0633-01-01", "content": "Shrinigar-Sakala"},
    {"id": 25, "end": "0633-12-31", "descr": "Just outside Sakala, Xuanzang and his caravan encountered a band of 50 robbers who took their clothes and goods. The robbers then chased the group into a dired marsh with their swords drawn. A young monk helps Xuanzang escape, and the pair runs for help. Around 80 people from the nearby village assembled with weapons and followed Xuanzang and the young monk back to the marsh where the robbers were. The robbers fled, and the caravan was saved. \\nAs the caravan was saddened and lamenting their misfortune they notice Xuanzang is in good spirits. How is it that that the Master (Xuanzang) alone does not share in our sorrow, but is able to keep a smile on his face? Answering he said: The greatest gift which living creatures posses, is life. If life is safe, what need we care about the rest? Hwui-Li", "start": "0633-01-01", "content": "Sakala-Chinabhukti"},
    {"id": 26, "end": "0634-12-31", "descr": "", "start": "0634-01-01", "content": "Chinabhukti-Jalandhara"},
    {"id": 27, "end": "0634-12-31", "descr": "", "start": "0634-01-01", "content": "Jalandhara-Bairata"},
    {"id": 28, "end": "0634-12-31", "descr": "", "start": "0634-01-01", "content": "Bairata-Mathura"},
    {"id": 29, "end": "0634-12-31", "descr": "", "start": "0634-01-01", "content": "Mathura-Srughna"},
    {"id": 30, "end": "0635-12-31", "descr": "", "start": "0635-01-01", "content": "Srughna-Matipura"},
    {"id": 31, "end": "0635-12-31", "descr": "", "start": "0635-01-01", "content": "Matipura-Sankasya"},
    {"id": 32, "end": "0635-12-31", "descr": "", "start": "0635-01-01", "content": "Sankasya-Kanyakubja"},
    {"id": 33, "end": "0636-12-31", "descr": "After traipsing through dense jungles filled with elephants and other wild beast, Xuanzang reached Kausambi. Kausambi is the location of a Buddhist legend. King Udayana had a sandalwood image of the Buddha carved while the Buddha was in heaven preaching to his mother. When the Buddha returned to earth, the staue rose and saluted Buddha. Xuanzang had his third image of Buddha made here. It was a replica of the image from the temple.", "start": "0636-01-01", "content": "Kanyakubja-Kausambi"},
    {"id": 34, "end": "0636-12-31", "descr": "", "start": "0636-01-01", "content": "Kausambi-Ayodhya"},
    {"id": 35, "end": "0636-12-31", "descr": "", "start": "0636-01-01", "content": "Ayodhya-Srvasti"},
    {"id": 36, "end": "0636-12-31", "descr": "Xuanzang reached Kapilavastu after travelling through a semi tropical forested region filled with deserted monasteries. Kapilavastu was the kingdom where the buddha grew up.", "start": "0636-01-01", "content": "Sravasti-Kapilavastu"},
    {"id": 37, "end": "0636-12-31", "descr": "", "start": "0636-01-01", "content": "Kapilavastu-Lumbini"},
    {"id": 38, "end": "0636-12-31", "descr": "", "start": "0636-01-01", "content": "Lumbini-Kusinagara"},
    {"id": 39, "end": "0637-12-31", "descr": "", "start": "0637-01-01", "content": "Kusinagara-Sarnath and Varanasi"},
    {"id": 40, "end": "0637-12-31", "descr": "", "start": "0637-01-01", "content": "Sarnath and Varanasi-Vaisali"},
    {"id": 41, "end": "0637-12-31", "descr": "", "start": "0637-01-01", "content": "Vaisali-Pataliputra"},
    {"id": 42, "end": "0637-12-31", "descr": "", "start": "0637-01-01", "content": "Pataliputra-Bodh Gaya"},
    {"id": 43, "end": "0637-12-31", "descr": "", "start": "0637-01-01", "content": "Bodh Gaya-Nalanda"},
    {"id": 44, "end": "0637-12-31", "descr": "", "start": "0637-01-01", "content": "Nalanda-Irana"},
    {"id": 45, "end": "0638-12-31", "descr": "", "start": "0638-01-01", "content": "Irana-Assam"},
    {"id": 46, "end": "0639-12-31", "descr": "", "start": "0639-01-01", "content": "Assam-Samatata"},
    {"id": 47, "end": "0639-12-31", "descr": "", "start": "0639-01-01", "content": "Samatata-Tamrallipti"},
    {"id": 48, "end": "0639-12-31", "descr": "", "start": "0639-01-01", "content": "Tamrallipti-Dhanakataka"},
    {"id": 49, "end": "0639-12-31", "descr": "", "start": "0639-01-01", "content": "Dhanakataka-Kancipuram"},
    {"id": 50, "end": "0640-12-31", "descr": "", "start": "0640-01-01", "content": "Kancipuram-Nasik"},
    {"id": 51, "end": "0641-12-31", "descr": "", "start": "0641-01-01", "content": "Nasik-Ajanta"},
    {"id": 52, "end": "0641-12-31", "descr": "", "start": "0641-01-01", "content": "Ajanta-Bharukaccha"},
    {"id": 53, "end": "0641-12-31", "descr": "Xuanzang's route is very unclear in this region. He probably was following the ancient trade routes, where Buddhist monasteries were often located. He stopped in Ujjayini, where not far from the capital there was an Asoka-raja stupa, where Asoka constructed his hell.", "start": "0641-01-01", "content": "Bharukaccha-Ujjayini"},
    {"id": 54, "end": "0641-12-31", "descr": "", "start": "0641-01-01", "content": "Ujjayini-Multan"},
    {"id": 55, "end": "0641-12-31", "descr": "", "start": "0641-01-01", "content": "Multan-Parvata"},
    {"id": 56, "end": "0642-12-31", "descr": "Xuanzang spent two months in Parvata before returning to Nalanda. His route back to Nalanda is uncertain. Xuanzang noted that near the capital of Parvata was a monastery with 100 monks. It was an important place because some Buddhist masters had composed some of their Sutras and Sastras in the location.", "start": "0642-01-01", "content": "Parvata-Nalanda"},
    {"id": 57, "end": "0642-12-31", "descr": "", "start": "0642-01-01", "content": "Nalanda-Assam"},
    {"id": 58, "end": "0642-12-31", "descr": "", "start": "0642-01-01", "content": "Assam-Kanyakubja"},
    {"id": 59, "end": "0642-12-31", "descr": "Xuanzang accompanies King Harsha to Prayaga to celebrate his sixth Quinquennial Almsgiving. The king gave away all his possessions, then his vassals retrieve his goods. Offerings were also made to Buddha, and the Sun God.", "start": "0642-01-01", "content": "Kanyakubja-Prayaga"},
    {"id": 60, "end": "0643-12-31", "descr": "Xuanzang passes through Jalandhara once again on his return trip to Chang'an. Xuanzang was joined by 100 monks carrying sciptures and images.", "start": "0643-01-01", "content": "Prayaga-Jalandhara"},
    {"id": 61, "end": "0643-12-31", "descr": "Xuanzang passed through Taxila on his journey home. He was heading toward the Indus River, where he lost many manuscripts and texts in crossing.", "start": "0643-01-01", "content": "Jalandhara-Taxila"},
    {"id": 62, "end": "0644-12-31", "descr": "Xuanzang rode into Attock/Hund on the magnificent elephant King Harsha had given him for his journey home. Xuanzang crossed the Indus on his elephant, while all the Sacred books, images and holy relics from the land of India he had collected were on a boat. And now when the boat was in the mid-stream, all at once the winds ans the waters commingling, caused the waves to rise, and the boat, violently tossed, was almost swallowed up. The gaurdian of the books, filled with terror, fell into the water, but was finally rescued by the passengers\nxuanzang;5001;5001-63;360498;345473;Attock-Nagarahara;;0644-01-01,,,0644-12-31,;?;5001-62;\nxuanzang;5001;5001-64;345473;367083;Nagarahara-Kapisi;;0644-01-01,,,0644-12-31,;?;5001-63;\nxuanzang;5001;5001-65;367083;367091;Kapisi-Andarab;;0644-01-01,,,0644-12-31,;?;5001-64;Xuanzang reached Andarab after a diffucult crossing of the Hindu Kush Mountains. In Andarab there were 3 monasteries where Xuanzang rested for 5 days before continuing on. \\nAfter seven days they reached a great mountain top", "start": "0644-01-01", "content": "Taxila-Attock"},
    {"id": 63, "end": "0644-12-31", "descr": "Xuanzang stopped in Kunduz again on his way home to China. He stayed one month waiting on copies of texts he had lost in the Indus River.", "start": "0644-01-01", "content": "Andarab-Kunduz"},
    {"id": 64, "end": "0644-12-31", "descr": "Xuanzang stopped for one month in Faizabad because the passes of the Pamirs were still covered in snow. There were several monasteries here, and the area was abundant in ruby mines.", "start": "0644-01-01", "content": "Kunduz-Faizabad"},
    {"id": 65, "end": "0644-12-31", "descr": "", "start": "0644-01-01", "content": "Faizabad-Tashkurghan"},
    {"id": 66, "end": "0644-12-31", "descr": "Xuanzang stopped in Tashkurghan for one month before continuing on towards Kashgar oasis. Xuanzang was impressed by the king, who honored Buddhism. Not long after leaving Tashkurghan, Xuanzang's elephant drowned in a river after the carvan was attacked by bandits. \\nThe Master of the Law (Xuanzang) remained in this country for 20 days or so, and then going north-east for five days he fell in with a band of robbers\nxuanzang;5001;5001-70;348056;348053;Kashgar-Yarkand;;0644-01-01,,,0644-12-31,;?;5001-69;After crossing a mountain range, Xuanzang reaches Yarkand. \\nTo the south of this country there is a high mountain in which there are a number of niches like chambers", "start": "0644-01-01", "content": "Tashkurghan-Kashgar"},
    {"id": 67, "end": "0644-12-31", "descr": "", "start": "0644-01-01", "content": "Yarkand-Khotan"},
    {"id": 68, "end": "0644-12-31", "descr": "", "start": "0644-01-01", "content": "Khotan-Niya"},
    {"id": 69, "end": "0644-12-31", "descr": "Xuanzang briefly passes through Niya before trekking through the merciless drifitng sands of the desert where there is no water or vegetation.", "start": "0644-01-01", "content": "Niya-Cherchen"},
    {"id": 70, "end": "0644-12-31", "descr": "Xuanzang reaches Cherchen, another oasis town on the route back to Chang'an. He took respite from the forceful desert winds, blowing sans, and lack of water here. \\nEastward of this again is the desert of drifting sand, without water or vegetation, burning hot, and subject to the evil poisonous fiendsand imps. There is no road, and travellers in coming and going have only to look for the deserted bones of men and cattle as their guide. Hwui-Li", "start": "0644-01-01", "content": "Cherchen-Charkhlik"},
    {"id": 71, "end": "0644-12-31", "descr": "Xuanzang stopped at this oasis located on the southern Silk Road route on the Taklamakan Desert. Oases such as Charkhlik were places to resupply and rest, after battling through the torturous desert landscapes.", "start": "0644-01-01", "content": "Charkhlik-Loulan"},
    {"id": 72, "end": "0644-12-31", "descr": "", "start": "0644-01-01", "content": "Loulan-Tun-huang"},
    {"id": 73, "end": "0644-12-31", "descr": "", "start": "0644-01-01", "content": "Tun-huang-Liangzhou"},
    {"id": 74, "end": "0645-12-31", "descr": "Xuanzang briefly passed through Liangzhou again on his journey back to Chang'an.", "start": "0645-01-01", "content": "Liangzhou - An-hsi"},
    {"id": 75, "end": "0645-12-31", "descr": "Xuanzang returned through this town on the edge of the Gobi Desert on the last leg of his trip back to Chang'an.", "start": "0645-01-01", "content": "An-hsi - Jade Gate"},
    {"id": 76, "end": "0645-12-31", "descr": "Xuanzang passed back through the Jade Gate in 645 CE on his return to Chang'an. This time he did not have to hide during the day and travel at night. Xuanzang was heading toward a heros welcome in his hometown.", "start": "0645-01-01", "content": "Jade Gate-Chang'an"}

  ]);
  //
  // Create a DataSet (allows two way data-binding)
  // var items = new vis.DataSet([
  //   {id: 1, content: 'item 1', descr: 'item 1', start: '2013-04-20', end: '2013-04-22'},
  //   {id: 2, content: 'item 2', start: '2013-04-14', end: '2013-04-15'},
  //   {id: 3, content: 'item 3', start: '2013-04-18', end: '2013-04-18'},
  //   {id: 4, content: 'item 4', start: '2013-04', end: '2013-05'},
  //   {id: 5, content: 'item 5', start: '2013-04-25', end: '2013-04-30'},
  //   {id: 6, content: 'item 6', start: '2013-04-27', end: '2013-05-27',
  //     className:"hideme"}
  // ]);

  // Create a Timeline
  var timeline = new vis.Timeline(container, items, options);
}
