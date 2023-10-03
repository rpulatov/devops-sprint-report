const URI = "data:application/vnd.ms-excel;base64,"
const TEMPLATE = `<html
                    xmlns:o="urn:schemas-microsoft-com:office:office"
                    xmlns:x="urn:schemas-microsoft-com:office:excel"
                    xmlns="http://www.w3.org/TR/REC-html40"
                  >
                    <head>
                      <!--[if gte mso 9]>
                        <xml>
                          <x:ExcelWorkbook>
                            <x:ExcelWorksheets>
                              <x:ExcelWorksheet>
                                <x:Name>{worksheet}</x:Name>
                                <x:WorksheetOptions>
                                  <x:DisplayGridlines />
                                </x:WorksheetOptions>
                              </x:ExcelWorksheet>
                            </x:ExcelWorksheets>
                          </x:ExcelWorkbook>
                        </xml>
                      <![endif]-->
                      <meta http-equiv="content-type" content="text/plain; charset=UTF-8" />
                    </head>
                    <body>
                      <table>
                        {table}
                      </table>
                    </body>
                  </html>`

function base64(s: string) {
  return btoa(unescape(encodeURIComponent(s)))
}

type TableContext = { [key: string]: string }
function format(s: string, tableContext: TableContext) {
  return s.replace(/{(\w+)}/g, function (m, word: string) {
    return tableContext[word]
  })
}
function downloadURI(uri: string, name: string) {
  const link = document.createElement("a")
  link.download = name
  link.href = uri
  link.click()
}

export function tableToExcel(
  table: HTMLElement | string,
  name: string,
  fileName: string
) {
  const tableElement =
    table instanceof HTMLElement ? table : document.getElementById(table)

  if (!tableElement) throw new Error(`Element ${table} not found`)

  const ctx = {
    worksheet: name || "Worksheet",
    table: tableElement.innerHTML,
  }
  const resuri = URI + base64(format(TEMPLATE, ctx))
  downloadURI(resuri, fileName)
}
