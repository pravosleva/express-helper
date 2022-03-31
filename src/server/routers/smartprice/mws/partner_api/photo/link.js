/* eslint-disable import/extensions */
// @ts-ignore
import { getRandomInteger } from '../../../../../utils/getRandomInteger'

const { SUCCESS_ANYWAY } = process.env

const toClient = [
  {
    ok: false,
    code: '_tmp_dev',
    message: '_dev_test',
  },
  {
    ok: true,
    qr:
      'iVBORw0KGgoAAAANSUhEUgAAAjoAAAI6AQAAAAAGM99tAAAFUklEQVR4nO2dTYrcSBCFX4wKaimBD9BHkW5mfKS5gXSUPsBAalkg8WaRGfmjNnigqmfS0y8XhVul+khBOHgZfzLiJWv74zUcQCCBBBJIIIEEEkgggf4vIEvrlq5u02m24DQAp9kCANjNsE2ALQBs2f1Hy2fsSCCBXgKaSZIB0agxhyGdLDe7pWvbVK6ZARhIkmxBL9uRQAI9tdxL7xMw/wnYHEBsS7pmM88bgIE2h8mAESBwxp8ZMByv3pFAAr1kRb87B6B4ajIAXMcDXDEQM4/4J2aSwHiAjDcPjP5+7e/RBBKoXjMPACNpy34n5nAaNrsT2O8EcFq09n9vRwIJ9ARoJLkCAPZbVtKny+lwWjL5/c54CwCQPK6gl+1IIIFeANrMzGwCAAy072Eg5jDQFgC2YKAtbs/2PQC24IyhkU/akUACPbfYLmDM4Q4M5Bp9dr49+vaB1yWdLVBfoPoEmUwZuBwokSSJf4uR2doHWbZAXYKSz17hqjlGP6LFZhHtpuwBkhwbGeWzBeoT5GokCmu/WMf/UnCPa+Wp/ZbZ/y/IsgXqDOQ+ezzgGcWh+oiaeh3JizNPHyED+ns0gb40qFIj7oazoQfPn9fX/HdVzkaWLVB/ID9BepYxKu61OUtWtyQpfvghk7JsgfoE1T47rVLpVEvsq/ae3dqlswXqEeTqesyiA4CrjMY1pxNkExisftbfown0pUGV1ECOZ7tRu7uGl0XFFb33mK1dli1Qf6DWZyed7UfGbNQBSLeEwSPbfp98tkA9gnIOMtekeslI/LpkZbJ5V8dIjNLZAvUM4o+3h3EdHxaNFePDSgDbe2oApOaxbPfhs3YkkEBPrpKDLHmX+iwJoKkquRSPqPNAoD5BVUVUKgoJtXk3MgVtlASQGhGoW1BdN1KurSVKEj7cVztznSAF6hTUVER5lKROrLtMadLpRzZq5SAF6hPURP2qOLW39OZ4SUq7V5FAdfgK1DHIpzLgvCXVvIKGcYjtjtwWgNgBAMPhob+/cgwlgC/ekUACvWT9TGcjVYscV50d/9lGu+WzBeoRVMdGLjn16pp/cVHhPo1Eli1Qd6CoRpLe2L8R2wTDHKI4SeOhAIDb28OI3QBgALB/OzDzNKkRgXoENakZ99QoBawxexOG7J9docxsvXd/jybQlwbl2EhpOkCSJCwhvTF/wMMnVB+kQD2DqnkjpRO9qn6q+sYCqiJtVG5dli1Qf6Cqr9frRlIZdopdR2tPsyurJA1KZFuWLVCvIK7jw8zeDpjZ3S323Yzrbqm4L86unACksZXwUtbP2JFAAj25Sjy7PiPmRrGcTm9mnuVAt+sX+WyBOgO1Z8SjOjyiJNbpafdS65diI1RFlEB9gprpZ6EcCr0tssT1mAc3tNkb+WyBegRd+yBRpkCV8VAoTTQlkFKJE1m2QN2BGjUCeOADyAMZXKaUcsCqR0w6W6BOQe0s1mTU1StqamcOlFkM6vAVqG9QG8/O0Wn8pPTPP1IBa/5CPlugbkHpyOgWa99D+rp558FpnoUvDTiKZwvUJ6iuu74GQwJQxo+kCF+eRqL52QJ1Dapr/ZiteEXJsxeZktz6pWlSli1Qj6CPbzodjzovWV5HU7fYDHV3jSxboN8BNL/faWY32BJrSUiSD4svPi0vX5p5ANubdLZAvwko1zxhm4b40l6zySePbNMZX4HKHxPANb4M9XN3JJBAT4A8U0PyYT5t9TTM77eUs9neDsQ/t8lfhlp0ScePJtCXBF1jI/Fa1UQzfsi9+zTiulxbOlugzkDGX9/zT9bW36MJJJBAAgkkkEACCSTQfwb6G6w+Ylk54hZcAAAAAElFTkSuQmCC',
    short_url: 'https://test.smartprice.ru/su/rUbsMA',
    qr_url: 'https://test.smartprice.ru/filestorage/b1514409af9974e11959dcaf91570e19/51162/1617200522/3600',
  },
]

// FOR EXAMPLE:
// curl 'https://test.smartprice.ru/partner_api/photo/link' -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0' -H 'Accept: application/json' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' --compressed -H 'Content-Type: application/json' -H 'X-SP-WebUI: 1' -H 'X-Requested-With: XMLHttpRequest' -H 'Origin: https://test.smartprice.ru' -H 'Connection: keep-alive' -H 'Referer: https://test.smartprice.ru/tradein/' -H 'Cookie: _vwo_uuid_v2=D76F5C12A39277F50F7D8F2066ED8ED40|67cb3782e6064a8ab524cf5c88ab56b6; _cmg_csstkF4us=1615993943; _comagic_idkF4us=3728165770.6401720893.1615993942; csrftoken=fUPGZnhGZyAvBY25GjJyEL1zB6y9ZEqCCg64AooZx7DjVvsOKU3Fg5Cc8o86g9gg; spuid_dev=1322386951608307617; utm_source=test.smartprice.ru; spots_dev.1=24.31224f353fcdb3c1212506adda62277c; rc_uid=32cbd940-a25b-47c0-b520-d3b6f93985e9; only_existing_experiment=1; spAuthSessId=txk0p013a4h5w5was5i0ckdm26o9klgb' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw '{"id":"114851"}'

export default async (req, res) => {
  const toBeOrNotToBe = SUCCESS_ANYWAY ? 1 : getRandomInteger(0, 1)

  setTimeout(() => {
    res.status(200).send({
      ...toClient[toBeOrNotToBe],
      _originalBody: req.body,
    })
  }, 500)
}
