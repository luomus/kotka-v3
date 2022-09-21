/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface IucnRedListEvaluation {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  actionNotes?: string;
  borderGain?: boolean;
  borderGainNotes?: string;
  countOfOccurrencesMax?: string;
  countOfOccurrencesMin?: string;
  countOfOccurrencesNotes?: string;
  /**
   * <p> <b>A1</b>	Havaittu, arvioitu, päätelty tai epäilty populaation pieneneminen äärimmäisen uhanalaisilla vähintään 90 %:lla, erittäin uhanalaisilla vähintään 70 %:lla ja vaarantuneilla vähintään 50 %:lla viimeisten kymmenen vuoden tai kolmen sukupolven aikana (valitaan pitempi jakso) tilanteessa, jossa pienenemisen syyt ovat selvästi peruttavissa JA tunnettuja JA loppuneita, perustuen johonkin seuraavista vaihtoehdoista: </p> <ul><li><b>(a)</b> suora havainto</li> <li><b>(b)</b> taksonille käyttökelpoinen runsausindeksi</li> <li><b>(c)</b> esiintymisalueen tai levinneisyysalueen pieneneminen ja/tai elinympäristön laadun huonontuminen</li> <li><b>(d)</b> todellinen tai mahdollinen hyödyntäminen</li> <li><b>(e)</b> vieraiden taksonien, risteytymisen, tautien, saasteiden, kilpailijoiden tai loisten haitalliset vaikutukset.</li></ul> <p> <b>A2</b>	Havaittu, arvioitu, päätelty tai epäilty populaation pieneneminen äärimmäisen uhanalaisilla vähintään 80 %:lla, erittäin uhanalaisilla vähintään 50 %:lla ja vaarantuneilla vähintään 30 %:lla viimeisten kymmenen vuoden tai kolmen sukupolven aikana (valitaan pitempi jakso) tilanteessa, jossa pieneneminen ja sen syyt eivät ehkä ole loppuneet TAI niitä ei tunneta TAI ne eivät ehkä ole peruttavissa, perustuen yllä oleviin vaihtoehtoihin <b>(a)–(e)</b>. </p> <p> <b>A3</b>	Äärimmäisen uhanalaisilla vähintään 80 %, erittäin uhanalaisilla vähintään 50 % ja vaarantuneilla vähintään 30 % populaation pieneneminen, jonka ennustetaan tai epäillään tapahtuvan tulevien kymmenen vuoden tai kolmen sukupolven aikana (valitaan pitempi jakso, korkeintaan 100 vuotta), perustuen yllä oleviin vaihtoehtoihin <b>(b)–(e)</b>. </p> <p> <b>A4</b>	Havaittu, arvioitu, päätelty, ennustettu tai epäilty populaation pieneneminen äärimmäisen uhanalaisilla vähintään 80 %:lla, erittäin uhanalaisilla vähintään 50 %:lla ja vaarantuneilla vähintään 30 %:lla kymmenen vuoden tai kolmen sukupolven ajanjaksolla (valitaan pitempi; tulevaisuuteen maksimi 100 vuotta), johon sisältyy sekä mennyttä että tulevaa, ja pieneneminen ja sen syyt eivät ole loppuneet TAI niitä ei tunneta TAI ne eivät ehkä ole peruttavissa, perustuen yllä oleviin vaihtoehtoihin <b>(a)–(e)</b>. </p>
   */
  criteriaA?: string;
  criteriaANotes?: string;
  /**
   * <p> Maantieteellinen alue tarkasteltuna joko
   * levinneisyysalueen (B1) tai esiintymisalueen (B2) tai
   * molempien mukaan.</p>
   *
   * <p>
   * <b>B1</b>	Levinneisyysalueen arvioidaan olevan äärimmäisen
   * uhanalaisilla alle 100 km², erittäin uhanalaisilla alle 5 000
   * km², vaarantuneilla alle 20 000 km² ja vähintään kaksi kohdista
   * a–c täyttyy:
   * </p>
   * <p>
   * <b>B1a.</b> esiintyminen on voimakkaasti pirstoutunut TAI äärimmäisen
   * uhanalaisilla vain yksi tai erittäin uhanalaisilla enintään viisi tai
   * vaarantuneilla enintään kymmenen esiintymispaikkaa tunnetaan
   * </p>
   * <p>
   * <b>B1b.</b> havaittu, päätelty tai ennustettu jatkuva väheneminen
   * joissakin seuraavista:
   * </p>
   * <ul><li><b>(i)</b> levinneisyysalue</li>
   * <li><b>(ii)</b> esiintymisalue</li>
   * <li><b>(iii)</b> soveliaan elinympäristön määrä ja/tai
   * laatu</li>
   * <li><b>(iv)</b> esiintymien tai osapopulaatioiden määrä</li>
   * <li><b>(v)</b> lisääntymiskykyisten yksilöiden määrä</li></ul>
   *
   * <p>
   * <b>B1c.</b> erittäin suuret vaihtelut joissakin seuraavista:
   * </p>
   * <ul><li><b>(i)</b> levinneisyysalue</li>
   * <li><b>(ii)</b> esiintymisalue</li>
   * <li><b>(iii)</b> esiintymien tai osapopulaatioiden määrä</li>
   * <li><b>(iv)</b> lisääntymiskykyisten yksilöiden määrä</li></ul>
   *
   *
   * <p>
   * <b>B2</b>	Esiintymisalueen arvioidaan olevan äärimmäisen
   * uhanalaisilla alle 10 km², erittäin uhanalaisilla alle 500 km²,
   * vaarantuneilla alle 2 000 km² ja vähintään kaksi kohdista
   * a–c täyttyy:
   * </p>
   * <p>
   * <b>B2a.</b> esiintyminen on voimakkaasti pirstoutunut TAI äärimmäisen
   * uhanalaisilla vain yksi tai erittäin uhanalaisilla enintään viisi tai
   * vaarantuneilla enintään kymmenen esiintymispaikkaa tunnetaan
   * </p>
   * <p>
   * <b>B2b.</b> havaittu, päätelty tai ennustettu jatkuva väheneminen
   * joissakin seuraavista:
   * </p>
   * <ul><li><b>(i)</b> levinneisyysalue</li>
   * <li><b>(ii)</b> esiintymisalue</li>
   * <li><b>(iii)</b> soveliaan elinympäristön määrä ja/tai laatu</li>
   * <li><b>(iv)</b> esiintymien tai osapopulaatioiden määrä</li>
   * <li><b>(v)</b> lisääntymiskykyisten yksilöiden määrä</li></ul>
   *
   * <p>
   * <b>B2c.</b> erittäin suuret vaihtelut joissakin seuraavista:
   * </p>
   * <ul><li><b>(i)</b> levinneisyysalue</li>
   * <li><b>(ii)</b> esiintymisalue</li>
   * <li><b>(iii)</b> esiintymien tai osapopulaatioiden määrä</li>
   * <li><b>(iv)</b> lisääntymiskykyisten yksilöiden määrä</li></ul>
   */
  criteriaB?: string;
  criteriaBNotes?: string;
  /**
   * <p>Pieni ja jatkuvasti taantuva populaatio	Populaatio on arvioitu pienemmäksi kuin äärimmäisen
   * uhanalaisilla 250, erittäin uhanalaisilla 2 500 ja vaarantuneilla
   * 10 000 lisääntymiskykyistä yksilöä sekä jompikumpi
   * seuraavista:</p>
   *
   * <p>
   * <b>C1</b>	Äärimmäisen uhanalaisilla vähintään 25 %:n jatkuva
   * väheneminen kolmen vuoden tai yhden sukupolven aikana
   * (valitaan pitempi jakso, tulevaisuuteen korkeintaan
   * 100 vuotta), erittäin uhanalaisilla vähintään 20 %:n jatkuva
   * väheneminen viiden vuoden tai kahden sukupolven aikana
   * (valitaan pitempi jakso, tulevaisuuteen korkeintaan
   * 100 vuotta) ja vaarantuneilla vähintään 10 %:n jatkuva
   * väheneminen kymmenen vuoden tai kolmen sukupolven
   * aikana (valitaan pitempi jakso, tulevaisuuteen korkeintaan
   * 100 vuotta)
   * </p>
   *
   * <p>
   * <b>C2</b>	Havaittu, ennustettu tai päätelty lisääntymiskykyisten
   * yksilöiden määrän jatkuva väheneminen JA vähintään
   * toinen seuraavista (a–b):
   * </p>
   * <p>
   * <b>C2a.</b> populaation rakenne joko:
   * </p>
   * <ul><li>
   * <b>(i)</b> missään osapopulaatiossa ei ole äärimmäisen
   * uhanalaisilla yli 50, erittäin uhanalaisilla yli
   * 250 ja vaarantuneilla yli 1 000 lisääntymiskykyistä
   * yksilöä</li>
   * <li>
   * <b>(ii)</b> äärimmäisen uhanalaisilla vähintään 90 % ja
   * erittäin uhanalaisilla vähintään 95 % lisääntymiskykyisistä
   * yksilöistä sekä vaarantuneilla
   * kaikki yksilöt ovat yhdessä osapopulaatiossab. erittäin suuret vaihtelut lisääntymiskykyisten
   * yksilöiden määrässä
   * </li></ul>
   *
   * <p>
   * <b>C2b.</b> erittäin suuret vaihtelut lisääntymiskykyisten
   * yksilöiden määrässä
   * </p>
   */
  criteriaC?: string;
  criteriaCNotes?: string;
  /**
   * <p>Populaation arvioitu koko on äärimmäisen uhanalaisilla
   * alle 50 ja erittäin uhanalaisilla alle 250 lisääntymiskykyistä
   * yksilöä. Vaarantuneilla populaatio on hyvin pieni tai
   * rajoittunut jommankumman vaihtoehdon mukaan:</p>
   * <p>
   * <b>D1</b>	Arvioitu populaatiokoko on alle 1 000 lisääntymiskykyistä
   * yksilöä.
   * </p>
   *
   * <p>
   * <b>D2</b>	Populaatiolla on hyvin rajoittunut esiintymisalue
   * (yleensä alle 20 km²) tai vähän esiintymispaikkoja (yleensä
   * korkeintaan viisi), ja populaatio on siten altis äkillisille
   * ja ennustamattomille ihmistoiminnan tai sattuman vaikutuksille
   * ja voi lyhyessä ajassa muuttua äärimmäisen
   * uhanalaiseksi tai jopa hävitä.
   * </p>
   */
  criteriaD?: string;
  criteriaDNotes?: string;
  /**
   * <p>Kvantitatiivisen analyysin perusteella todennäköisyys
   * hävitä luonnosta on äärimmäisen uhanalaisilla vähintään
   * 50 % kymmenen vuoden tai kolmen sukupolven aikana
   * (valitaan pitempi, korkeintaan 100 vuotta), erittäin
   * uhanalaisilla vähintään 20 % kahdenkymmenen vuoden
   * tai viiden sukupolven aikana (valitaan pitempi, korkeintaan
   * 100 vuotta) ja vaarantuneilla vähintään 10 % sadan
   * vuoden aikana.Kvantitatiivisen analyysin perusteella todennäköisyys
   * hävitä luonnosta on äärimmäisen uhanalaisilla vähintään
   * 50 % kymmenen vuoden tai kolmen sukupolven aikana
   * (valitaan pitempi, korkeintaan 100 vuotta), erittäin
   * uhanalaisilla vähintään 20 % kahdenkymmenen vuoden
   * tai viiden sukupolven aikana (valitaan pitempi, korkeintaan
   * 100 vuotta) ja vaarantuneilla vähintään 10 % sadan
   * vuoden aikana.
   * </p>
   */
  criteriaE?: string;
  criteriaENotes?: string;
  criteriaForStatus?: string;
  criteriaForStatusNotes?: string;
  criteriaNotes?: string;
  /**
   * <ul> <li><b>1. Tuntematon alkuperä.</b> Taksoni tunnetaan vain yhdestä tai muutamasta yksilöstä/ näyteestä, joiden löytöpaikkaa ei tunneta tai paikkatiedot ovat hyvin epätarkat, joten taksonin tilaa ei voida päätellä. </li><li><b>2. Taksonominen epävarmuus.</b> Tietojen vähäisyys voi olla seurausta taksonomisesta epävarmuudesta eli levinneisyydestä, ekologiasta, tilasta, ja uhkista on vähän tietoa, koska vähäinen näytteiden ja/ tai havaintojenmäärä johtuu siitä että taksonia edustaa poikkeava yksilö, hybridi, harvinainen värimuoto tai muun lajin alalajia. Se voi selittää tiedon puutetta yhtä todennäköisesti tai todennäköisemmin kuin se, että taksoni on aidosti harvinainen, uhanalainen tai riittämättömästi etsitty. Tästä on kuitenkin erotettava ne taksonit, joiden taksonomiassa/ taksonomisessa asemassa on jotain epäselvää: ne on joko arvioitava normaalisti tai jätettävä arvioinnin ulkopuolelle (NE) ja tästä arviointilistalle mukaan ottamisesta on päätettävä arvioinnin vaiheessa 1 (luku 2). </li><li><b>3. Puutteelliset tiedot.</b> Tiedot ovat riittämättömät arviointikriteerien soveltamiseksi eli kaikki muut syyt tietojen vähäisyyteen. </li></ul>
   */
  ddReason?:
    | ""
    | "MKV.ddReasonIncompleteSpatialData"
    | "MKV.ddReasonIncompleteTaxonomicData"
    | "MKV.ddReasonIncompleteOtherData";
  ddReasonNotes?: string;
  decreaseDuringPeriod?: string;
  decreaseDuringPeriodNotes?: string;
  distributionAreaMax?: string;
  /**
   * Merkitäksesi "enintään" jätä alaraja tyhjäksi. Merkitäksesi "vähintään" jätä yläraja tyhjäksi.
   */
  distributionAreaMin?: string;
  distributionAreaNotes?: string;
  editNotes?: string;
  endangermentReasonNotes?: string;
  evaluatedTaxon: string;
  /**
   * <p>Tarkastelujakso = 3 x sukupolven pituus A-kriteerissä. Minimi 10 vuotta lyhytikäisillä lajeilla, maksimi 100 vuotta pitkäikäisillä lajeilla.</p>
   * <p>C-kriteerissä tarkastelujakson pituus vaihtelee luokasta riippuen 1-3 sukupolvea tai 3,5, tai 10 v.</p>
   * <p>Kenttä on tarkoitettu ensisijaisesti A-kriteeriä varten. Jos on samaan aikaan käytössä myös C-kriteeri, merkitse siihen liittyvä jakson pituus kommenttikenttään.</p>
   */
  evaluationPeriodLength?: string;
  evaluationPeriodLengthNotes?: string;
  evaluationYear: string;
  /**
   * <p>Arvioinnin viimeisessä vaiheessa otetaan huomioon Suomen ulkopuolella olevien populaatioiden mahdollinen vaikutus arvioitavaan Suomen populaatioon. Tarvittaessa alennetaan tai korotetaan luokkaa sen perusteella. Luokkaa alennetaan, jos ulkopuolelta saatava täydennys voi vähentää lajin häviämisriskiä. Alennettu tai korotettu luokka on lajin lopullinen uhanalaisuusluokka. </p>
   *
   * <p>Luokka-kenttään asetetaan alennuksen tai korotuksen aiheuttama lopputulos. Tähän kenttään asetetaan tieto tehdystä alennuksesta tai korotuksesta.</p>
   */
  externalPopulationImpactOnRedListStatus?:
    | ""
    | "MKV.externalPopulationImpactOnRedListStatusEnumMinus1"
    | "MKV.externalPopulationImpactOnRedListStatusEnumMinus2"
    | "MKV.externalPopulationImpactOnRedListStatusEnumPlus1"
    | "MKV.externalPopulationImpactOnRedListStatusEnumPlus2";
  externalPopulationImpactOnRedListStatusNotes?: string;
  /**
   * <p>Onko populaatio voimakkaasti pirstoutunut? = enemmän kuin puolet yksilöistä (tai enemmän kuin puolet asutusta elinympäristöstä) on pienissä eristyneissä laikuissa, jotka ovat </p> <li>liian pieniä ylläpitämään elinvoimaista populaatiota ja</li> <li>kaukana muista elinympäristölaikuista suhteessa lajin leviämiskykyyn.</li>
   */
  fragmentedHabitats?: boolean;
  fragmentedHabitatsNotes?: string;
  /**
   * Vuosissa. (Ks. IUCN-ohje, viimeksi syntyneiden yksilöiden vanhempien keskim. ikä)
   */
  generationAge?: number;
  generationAgeNotes?: string;
  groundsForEvaluationNotes?: string;
  habitatGeneralNotes?: string;
  habitatNotes?: string;
  /**
   * <ul> <li><b>P - Pyynti:</b> metsästys, kalastus ja laiton tappaminen, myös esimerkiksi muiden eläinten jääminen kalanpyydyksiin</li> <li><b>Ke - Keräily ja poiminta</b>, myös siirto puutarhaan</li> <li><b>H - Häirintä ja liikenne</b></li> <li><b>Ku - Kuluminen:</b> maa - ja kallioperän kuluminen, esimerkiksi tallaamisen, maastoajon, kalliokiipeilyn tai ylilaidunnuksen vuoksi</li> <li><b>R - Rakentaminen (maalla):</b> asutukseen, elinkeinoihin, liikenteeseen ja virkistyskäyttöön liittyvä rakentaminen tierakentaminen, rakentamiseen liittyvät maansiirrot ja läjitykset</li> <li><b>Ks - Kaivannaistoiminta:</b> maa - aineksen ja kalliokiviaineksen otto, kaivostoiminta</li> <li><b>Pm - Peltomaiden muutokset:</b> salaojitus, viljelytapojen muutokset, karjanhoidon muutokset (ei laidunten sulkeutuminen), koneiden käyttö ja viljeltävien lajien vaihdot (ei torjunta - aineet)</li> <li><b>Pr - Pellonraivaus:</b> metsien, soiden ja niittyjen muuttaminen pelloiksi</li> <li><b>N - Avoimien alueiden sulkeutuminen:</b> mm. niitty - ja hakamaiden sekä metsälaidunten sulkeutuminen laidunnuksen ja niiton loputtua, sorakuoppien ja muiden avointen kenttien metsittäminen ja umpeenkasvu</li> <li><b>M - Metsien uudistamis - ja hoitotoimet:</b> toimet, jotka eivät sisälly seuraaviin uhkatekijöihin, esim. maaperän muokkaus. Uhanalaisuuden syynä metsien käyttö. Tarkennetaan työdokumentoinnissa</li> <li><b>Mp - Metsien puulajisuhteiden muutokset:</b> mm. lehtipuiden väheneminen ja lehtojen kuusettuminen</li> <li><b>Mv - Vanhojen metsien väheneminen:</b> vanhojen metsien ja kookkaiden puiden väheneminen</li> <li><b>Mk - Kuloalueiden väheneminen:</b> Kuloalueiden ja muiden luontaisen sukkession alkuvaiheiden väheneminen</li> <li><b>Ml - Lahopuun väheneminen:</b> lahoavan puuaineksen, kuolleiden tai kuolevien puiden sekä oksien, lahoja kolopuiden väheneminen</li> <li><b>O - Ojitus ja turpeenotto</b>, (ei purojen perkaukset): myös kunnostusojitus ja aikaisemmin tehdyn ojituksen myöhäisemmät vaikutukset</li> <li><b>Vr - Vesirakentaminen:</b> voimalaitokset, saha - ja myllypadot, vesien säännöstely, ruoppaukset ja perkaukset (myös purojen), rantavyöhykkeen rakenteellinen muuttaminen (esim. pengerrykset), järvien laskut, tekoaltaiden rakentaminen, pohjaveden otto ja lähteiden hyödyntäminen, mm. pohjaveden pinnan laskun aiheuttamat muutokset</li> <li><b>Kh - Kemialliset haittavaikutukset:</b> ympäristömyrkyt, torjunta - aineet, ilman ja vesien saasteet, öljyvahingot sekä rehevöittävä laskeuma</li> <li><b>I - Ilmastonmuutos:</b> ennustettu ilmaston lämpeneminen, sademäärien lisääntyminen ja äärimmäisten sääilmiöiden yleistyminen seuraavien 20–30 vuoden aikana (käytetään vain, kun on erityisiä perusteita ko. lajiin kohdistuville vaikutuksille)</li> <li><b>S - Satunnaistekijät:</b> satunnaistekijöiden aiheuttama uhka kun kanta tai esiintymisalue on hyvin pieni, myös lyhytaikaiset ilmastonmuutokset</li> <li><b>Kil - Kilpailu:</b> muiden lajien aiheuttama kilpailu</li> <li><b>Ris - Risteytyminen:</b> muiden lajien aiheuttama risteytyminen</li> <li><b>Kv - Suuret kannan vaihtelut</b></li> <li><b>U - Muutokset Suomen ulkopuolella:</b> esim. elinympäristöjen muutokset lintujen talvehtimisalueilla tai muuton aikaisilla levähdysalueilla, ulkomailla tapahtuva pyynti/metsästys</li> <li><b>Vie - Vieraiden lajien aiheuttamat uhat</b>: kilpailu, risteytyminen, taudit, ekosysteemimuutokset</li> <li><b>Muu - Muu tunnettu syy:</b> määriteltyihin uhkatekijöihin sisältymätön tunnettu syy, tarkennetaan työdokumentoinnissa</li> <li><b>? - Syy tuntematon</b></li> </ul>
   */
  hasEndangermentReason?: string[];
  hasOccurrence?: string[];
  /**
   * <ul> <li><b>P - Pyynti:</b> metsästys, kalastus ja laiton tappaminen, myös esimerkiksi muiden eläinten jääminen kalanpyydyksiin</li> <li><b>Ke - Keräily ja poiminta</b>, myös siirto puutarhaan</li> <li><b>H - Häirintä ja liikenne</b></li> <li><b>Ku - Kuluminen:</b> maa - ja kallioperän kuluminen, esimerkiksi tallaamisen, maastoajon, kalliokiipeilyn tai ylilaidunnuksen vuoksi</li> <li><b>R - Rakentaminen (maalla):</b> asutukseen, elinkeinoihin, liikenteeseen ja virkistyskäyttöön liittyvä rakentaminen tierakentaminen, rakentamiseen liittyvät maansiirrot ja läjitykset</li> <li><b>Ks - Kaivannaistoiminta:</b> maa - aineksen ja kalliokiviaineksen otto, kaivostoiminta</li> <li><b>Pm - Peltomaiden muutokset:</b> salaojitus, viljelytapojen muutokset, karjanhoidon muutokset (ei laidunten sulkeutuminen), koneiden käyttö ja viljeltävien lajien vaihdot (ei torjunta - aineet)</li> <li><b>Pr - Pellonraivaus:</b> metsien, soiden ja niittyjen muuttaminen pelloiksi</li> <li><b>N - Avoimien alueiden sulkeutuminen:</b> mm. niitty - ja hakamaiden sekä metsälaidunten sulkeutuminen laidunnuksen ja niiton loputtua, sorakuoppien ja muiden avointen kenttien metsittäminen ja umpeenkasvu</li> <li><b>M - Metsien uudistamis - ja hoitotoimet:</b> toimet, jotka eivät sisälly seuraaviin uhkatekijöihin, esim. maaperän muokkaus. Uhanalaisuuden syynä metsien käyttö. Tarkennetaan työdokumentoinnissa</li> <li><b>Mp - Metsien puulajisuhteiden muutokset:</b> mm. lehtipuiden väheneminen ja lehtojen kuusettuminen</li> <li><b>Mv - Vanhojen metsien väheneminen:</b> vanhojen metsien ja kookkaiden puiden väheneminen</li> <li><b>Mk - Kuloalueiden väheneminen:</b> Kuloalueiden ja muiden luontaisen sukkession alkuvaiheiden väheneminen</li> <li><b>Ml - Lahopuun väheneminen:</b> lahoavan puuaineksen, kuolleiden tai kuolevien puiden sekä oksien, lahoja kolopuiden väheneminen</li> <li><b>O - Ojitus ja turpeenotto</b>, (ei purojen perkaukset): myös kunnostusojitus ja aikaisemmin tehdyn ojituksen myöhäisemmät vaikutukset</li> <li><b>Vr - Vesirakentaminen:</b> voimalaitokset, saha - ja myllypadot, vesien säännöstely, ruoppaukset ja perkaukset (myös purojen), rantavyöhykkeen rakenteellinen muuttaminen (esim. pengerrykset), järvien laskut, tekoaltaiden rakentaminen, pohjaveden otto ja lähteiden hyödyntäminen, mm. pohjaveden pinnan laskun aiheuttamat muutokset</li> <li><b>Kh - Kemialliset haittavaikutukset:</b> ympäristömyrkyt, torjunta - aineet, ilman ja vesien saasteet, öljyvahingot sekä rehevöittävä laskeuma</li> <li><b>I - Ilmastonmuutos:</b> ennustettu ilmaston lämpeneminen, sademäärien lisääntyminen ja äärimmäisten sääilmiöiden yleistyminen seuraavien 20–30 vuoden aikana (käytetään vain, kun on erityisiä perusteita ko. lajiin kohdistuville vaikutuksille)</li> <li><b>S - Satunnaistekijät:</b> satunnaistekijöiden aiheuttama uhka kun kanta tai esiintymisalue on hyvin pieni, myös lyhytaikaiset ilmastonmuutokset</li> <li><b>Kil - Kilpailu:</b> muiden lajien aiheuttama kilpailu</li> <li><b>Ris - Risteytyminen:</b> muiden lajien aiheuttama risteytyminen</li> <li><b>Kv - Suuret kannan vaihtelut</b></li> <li><b>U - Muutokset Suomen ulkopuolella:</b> esim. elinympäristöjen muutokset lintujen talvehtimisalueilla tai muuton aikaisilla levähdysalueilla, ulkomailla tapahtuva pyynti/metsästys</li> <li><b>Vie - Vieraiden lajien aiheuttamat uhat</b>: kilpailu, risteytyminen, taudit, ekosysteemimuutokset</li> <li><b>Muu - Muu tunnettu syy:</b> määriteltyihin uhkatekijöihin sisältymätön tunnettu syy, tarkennetaan työdokumentoinnissa</li> <li><b>? - Syy tuntematon</b></li> </ul>
   */
  hasThreat?: string[];
  /**
   * Lisääntymiskykyisten yksilöiden määrä (ks. IUCN-ohje)
   */
  individualCountMax?: string;
  /**
   * Lisääntymiskykyisten yksilöiden määrä (ks. IUCN-ohje). Merkitäksesi "enintään" jätä alaraja tyhjäksi. Merkitäksesi "vähintään" jätä yläraja tyhjäksi.
   */
  individualCountMin?: string;
  individualCountNotes?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  /**
   * Merkitään tiedot mahdollisesti hävinneiden tai hävinneiden lajien viimeisistä havainnosta.
   */
  lastSightingNotes?: string;
  legacyPublications?: string;
  locked?: boolean;
  lsaRecommendation?: boolean;
  lsaRecommendationNotes?: string;
  occurrenceAreaMax?: string;
  /**
   * Merkitäksesi "enintään" jätä alaraja tyhjäksi. Merkitäksesi "vähintään" jätä yläraja tyhjäksi.
   */
  occurrenceAreaMin?: string;
  occurrenceAreaNotes?: string;
  occurrenceNotes?: string;
  occurrenceRegionsNotes?: string;
  occurrenceRegionsPrivateNotes?: string;
  /**
   * <p>Suulliset tai kirjalliset tiedonannot, henkilökohtaiset tiedostot, muistiinpanot tai julkaisemattomat aineistot, verkkosivut, keskustelupalstat ja tyypillisesti yhtä lajia koskevat epävirallisemmat lähteet</p> <p><b>Viittausohjeita:</b></p> 			 <p>Meikäläinen Matti suullinen tiedonanto 2016</p> <p>Virtanen Terhi, julkaisematon selvitysaineisto Hollolasta 2015</p> <p>Heikkinen Heikki, havaintotiedonanto Nisäkäsharrastajien Nisäkäsverkko-sähköpostilista 3.5.2014 (http://www.myrsky.com/mammals/nisakasverkko.htm)</p> <p>Nämä vitteet tallentuvat vain lomakkelle, niistä ei synny julkaisua.</p>
   */
  otherSources?: string;
  /**
   * Tyhjä = Tuntematon
   */
  percentageOfGlobalPopulation?: number;
  percentageOfGlobalPopulationNotes?: string;
  /**
   * Kenttä on tarkoitettu ensisijaisesti A-kriteeriä varten. Jos on samaan aikaan käytössä myös C-kriteerin eri pituinen tarkastelujakso, merkitse sen alun ja lopun populaatiokoko kommenttikenttään. Kommenttikentän käyttö koskee myös tilannetta, jossa on käytössä useita A:n alakriteereitä (A1-A4). Ensisijaisesti lomakkeelle merkitään lopulliseen uhanalaisuusluokkaan johtaneet tiedot.
   */
  populationSizePeriodBeginning?: string;
  populationSizePeriodEnd?: string;
  populationSizePeriodNotes?: string;
  /**
   * Onko vaihtelun suuruusluokka vähintään 10-kertainen?
   */
  populationVaries?: boolean;
  populationVariesNotes?: string;
  possiblyRE?: "" | "MX.iucnRE" | "MX.iucnEW" | "MX.iucnEX";
  possiblyRENotes?: string;
  /**
   * <p>Lisämerkinnät:</p>
   * <ul>
   * <li><b>v - vanhat metsät</b> (myös yksittäiset vanhat puut ja runsaasti lahopuuta sisältävät nuoremmat metsät)</li>
   * <li><b>h - harjumetsät</b>, myös puoliavoimet</li>
   * <li><b>p - metsäpaloalueet</b> ja muut luontaisen sukkession alkuvaiheen metsät</li>
   * <li><b>j - jalopuuesiintymä</b></li>
   * <li><b>pa - paahteinen</b></li>
   * <li><b>va - varjoinen</b></li>
   * <li><b>ra - sijaitsee rannalla</b> (lajin esiintyminen on sidoksissa rannan läheisyyteen)</li>
   * <li><b>ka - karut kalliot ja kivikot</b></li>
   * <li><b>ke - keskiravinteiset kalliot ja kivikot</b></li>
   * <li><b>ca - kalkkivaikutteinen</b></li>
   * </ul>
   */
  primaryHabitat?: string;
  /**
   * <p>Tieteelliset artikkelit, kirjat, julkaistut ja julkaisemattomat raportit,
   * tietokannat, rekisterit, atlas-sivustot ym. vakiintuneet lähteet</p>
   * <p><b>Viittausohjeita:</b></p> 			<p><b>Julkaisu</b>: Huhtinen, S., Salo, P., Haikonen, V.& von Bonsdorff, T. 2010: Kotelosienet. - Teoksessa: Rassi, P., Hyvärinen, E., Juslén, A. & Mannerkoski I. (toim.), Suomen lajien uhanalaisuus, Punainen kirja 2010: 272-277. Ympäristöministeriö & Suomen ympäristökeskus, Helsinki. 685 s.</p> 			<p><b>Tietokanta</b>: Noyes, J. S. 2014: Universal Chalcidoidea Database. – World Wide Web electronic publication. Accessed at http//www.nhm.ac.uk/chalcidoids on 18 December 2014.</p>
   */
  publication?: string[];
  /**
   * <p><b>Aito muutos (uusi):</b> muutos johtuu aidosta muutoksesta, joka on tapahtunut edellisen arvioinnin jälkeen (populaation tila huonontunut/ parantunut tms.)</p>
   * <p><b>Aito muutos (ennen edellistä arviointia):</b> luokkaa käytetään taksoneihin, jotka arvioidaan vähintään kolmatta kertaa ja joista lasketaan uhanalaisuusindeksi (Red List Index). Muutos on tapahtunut ennen edellistä arviointia, mutta ensimmäisen jälkeen. Muutos on havaittu uuden tiedon perusteella ja mikäli se olisi ollut käytettävissä aiemmin, uusi luokka olisi annettu jo aiemmalla kerralla (aiemmilla kerroilla). Muutoksen ajankohta on dokumentoitava.</p>
   * <p><b>Kriteerien muutos:</b> kategorian muutos johtuu arviointikriteerien muutoksista.</p>
   * <p><b>Uusi tieto:</b> muutos johtuu siitä, että taksonin statuksesta on saatu uutta tietoa/tieto on lisääntynyt; esim. populaatio on osoittautunut aiempaa käsitystä suuremmaksi tai pienemmäksi.</p>
   * <p><b>Taksonominen muutos:</b> kategorian muutos johtuu taksonomisen aseman muuttumisesta; taksoni on vastikään jaettu kahtia (alalajista laji) tai yhdistetty toisen kanssa tai kuvattu uutena tieteelle tai taksoni ei ole enää validi (pidetään nykyisin hybridinä, varianttina tms.).</p>
   * <p><b>Virhe:</b> luokka on väärä, koska arvioinnissa on aiemmin tapahtunut virhe.</p>
   * <p><b>Virheellinen tieto:</b> aiempi luokka on valittu virheellisen tiedon vuoksi väärin (esim. määritysvirhe).</p>
   * <p><b>Muu syy:</b> muutos johtuu muusta syystä kuin aiemmista ja/tai vaatii lisäselvitystä (esimerkiksi arvioijien suhtautuminen epävarmuuteen muuttuu tai arvioinnin tulkintaohjeet ovat muuttuneet.</p>
   */
  reasonForStatusChange?: (
    | ""
    | "MKV.reasonForStatusChangeGenuine"
    | "MKV.reasonForStatusChangeGenuineBeforePreviousEvaluation"
    | "MKV.reasonForStatusChangeChangesInCriteria"
    | "MKV.reasonForStatusChangeMoreInformation"
    | "MKV.reasonForStatusChangeChangesInTaxonomy"
    | "MKV.reasonForStatusChangeError"
    | "MKV.reasonForStatusChangeErroneousInformation"
    | "MKV.reasonForStatusChangeOther"
  )[];
  reasonForStatusChangeNotes?: string;
  /**
   * Tätä ei täytetä kuluvalle vuodelle. Muuttujaa käytetään ainoastaan tarvittaessa jälkikäteen uhanalaisuusindeksin laskemisessa. Jos tätä arviointia jälkikäteen halutaan korjata, arvioinnissa annettua luokkaa ei muuteta, vaan annetaan tässä korjattu luokka.
   */
  redListIndexCorrection?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  redListIndexCorrectionNotes?: string;
  redListStatus:
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  redListStatusAccuracyNotes?: string;
  redListStatusMax?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  redListStatusMin?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  redListStatusNotes?: string;
  regionallyThreatenedNotes?: string;
  regionallyThreatenedPrivateNotes?: string;
  remarks?: string[];
  secondaryHabitat?: string[];
  state: "MKV.stateReady" | "MKV.stateReadyForComments" | "MKV.stateStarted";
  statusA?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  statusANotes?: string;
  statusB?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  statusBNotes?: string;
  statusC?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  statusCNotes?: string;
  statusD?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  statusDNotes?: string;
  statusE?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  statusENotes?: string;
  taxonomicNotes?: string;
  threatNotes?: string;
  typeOfOccurrenceInFinland?:
    | ""
    | "MX.doesNotOccur"
    | "MX.typeOfOccurrenceOccurs"
    | "MX.typeOfOccurrenceStablePopulation"
    | "MX.typeOfOccurrenceCommon"
    | "MX.typeOfOccurrenceRare"
    | "MX.typeOfOccurrenceVeryRare"
    | "MX.typeOfOccurrenceVagrant"
    | "MX.typeOfOccurrenceRareVagrant"
    | "MX.typeOfOccurrenceMigrant"
    | "MX.typeOfOccurrenceImport"
    | "MX.typeOfOccurrenceAnthropogenic"
    | "MX.typeOfOccurrenceNotEstablished"
    | "MX.typeOfOccurrenceExtirpated"
    | "MX.typeOfOccurrenceOldRecords"
    | "MX.typeOfOccurrenceUncertain"
    | "MX.typeOfOccurrenceSpontaneousOldResident"
    | "MX.typeOfOccurrenceSpontaneousNewResident"
    | "MX.typeOfOccurrenceAlienOldResident"
    | "MX.typeOfOccurrenceSpontaneousNewEphemeral"
    | "MX.typeOfOccurrenceSpontaneousNewEphemeralOnlyOld"
    | "MX.typeOfOccurrenceSpontaneousOldFormerlyResidentPossiblyExtinct"
    | "MX.typeOfOccurrenceSpontaneousOldFormerlyResidentExtinct"
    | "MX.typeOfOccurrenceAlienNewEphemeral"
    | "MX.typeOfOccurrenceAlienNewEphemeralOnlyold"
    | "MX.typeOfOccurrenceAlienNewResident"
    | "MX.typeOfOccurrenceAlienOldFormerlyResidentPossiblyExtinct"
    | "MX.typeOfOccurrenceAlienOldExtinct"
    | "MX.typeOfOccurrenceSmallDegreeCultivatedOrigin"
    | "MX.typeOfOccurrenceNotableDegreeCultivatedOrigin"
    | "MX.typeOfOccurrenceCompletelyCultivatedOrigin"
    | "MX.typeOfOccurrenceOnlyCultivated"
    | "MX.typeOfOccurrenceMaxShortDistanceEscape"
    | "MX.typeOfOccurrenceMaxSoilImmigrant"
    | "MX.typeOfOccurrenceMaxReplanted"
    | "MX.typeOfOccurrenceMaxRelict"
    | "MX.typeOfOccurrenceNotEvaluated"
    | "MX.typeOfOccurrenceRegularBreeder"
    | "MX.typeOfOccurrenceIrregularBreeder"
    | "MX.typeOfOccurrencePassageMigrant"
    | "MX.typeOfOccurrenceBirdLifeCategoryA"
    | "MX.typeOfOccurrenceBirdLifeCategoryB"
    | "MX.typeOfOccurrenceBirdLifeCategoryC"
    | "MX.typeOfOccurrenceBirdLifeCategoryD"
    | "MX.typeOfOccurrenceBirdLifeCategoryE"
    | "MX.typeOfOccurrenceOccursBasedOnOccurrences";
  typeOfOccurrenceInFinlandNotes?: string;
}
