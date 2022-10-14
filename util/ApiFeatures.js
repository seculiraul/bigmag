/* 

MAI INTAI SE CREAZA QUERY UL APOI SE EXECUTA (PRIN AWAIT) NUMAI DUPA CE TOATE METODELE AU FOST FOLISTE

---- FILTRARE ----

    METODA --> FIND

    1. PENTRU FILTRARE TREBUIE CREATA O COPIE A REQ.QUERY

    2. TREBUIE STABILIT CE PARAMETRII SUNT
     EXCLUSI DIN FILTRARE (EX: PAGE, SORT, ETC) SI SE CREAZA UN ARRAY

    3. FIECARE ELEMENT DIN CEI EXCLUSI TREBUIE STERSI DIN OBIECT

    4. SE PUNE NOUL OBIECT IN FIND

    ---- FILTRARE AVANSATA ----

    METODA ---> FIND

    1. PENTRU OPERATORI GTE, GT, LT, LTE TREBUIE TRIMISI IN [], VOR VENI INTRUN ALT OBIECT
        IAR PENTRU ACESTIA TREBUIE ADAUGAT $ IN FATA LOR CU AJUTORUL UNUI REGEX
    
    2. SE CREAZA UN QUERY STRING DIN OBIECTUL CU PARAMETRI

    3. SE INLOCUIESTE GTE, GT, LTE, LT CU ACLEASI LUCRU DOAR CA AU $ IN FATA

    4. SE TRANSFORMA INAPOI IN OBIECT IAR OBIECUL SE FOLOSESTE LA FILTRARE

    ---- SORTARE ----

    METODA ----> SORT

    1. DACA SE SPECIFICA SORTAREA (UNU SAU MAI MULTI PARAMTRII)
     SE DESPART LA VIRGULA APOI SE FACE JOIN PRIN SPATIU
    
    2. SE PASEAZA ACEST SORTBY LA QUERY.SORT

    3. DACA NU SE SPECIFICA SORTAREA ACEASTA SE FACE PRIN SORTAREA UNUI CAMP DORIT

    (DACA PARAMETRUL E CU - ATUNCI ORDINEA E INVERSA)

    ---- SHOW FILEDS ----

    METODA ----> SELECT

    1. SIMILAR CU SORT SE SPECIFICA PARAMETRII APOI SE SEPARA LA VIRGULA 
    SI SE FACE JOIN PRINTR-UN SPATIU

    2. SE PASEAZA LA QUETY.SELECT

    3. SE POATE CREA SI UN DEFAUL

    (DACA PARAMETRUL E CU - ATUNCI EL VA FI EXCLUS)

    ---- PAGINATION ----

    METODA ----> SKIP + LIMIT

    1. SE STABILESTE CATE DOCUMENTE SA EXISTE PE PAGINA

    2. SE PRIMESTE DIN REQ ATAT NR DE PAGINA ( SI LIMITA OPTIONAL)

    3. SE CREAZA O CONSTANTA SKIP CU AJUTORUL FOMULEI (PAGE - 1)*LIMIT

    4. SE APELEAZA METODA SKIP APOI LIMIT

    5. DACA SKIP ESTE MAI MARE SAU EGAL DECAT NR DE DOCUMENTE SE AFISEAZA EROARE
 */
class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }



    filter() {
        let obj  = {...this.queryString};
        const excluded = ['limit', 'page', 'sort'];
        excluded.forEach(el => delete obj[el]);

        obj = JSON.stringify(obj);
        obj.replace(/\b(gt|gte|lt|lte)/g, match => `$${match}`);
        obj = JSON.parse(obj);
        this.query = this.query.find();

        return this;
    }

    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('createdAt');
        }
        return this;
    }

    limitFields() {
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = +this.queryString.page ?? 1;
        const limit = +this.queryString.limit ?? 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = ApiFeatures;