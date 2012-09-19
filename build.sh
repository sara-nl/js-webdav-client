#!/bin/bash
if [[ -r src/header.js ]]; then
  echo "Preparing dist.js with contents of header.js"
  cp src/header.js dist.js
else
  [[ -f dist.js ]] && rm dist.js
  touch dist.js
fi

if [[ -r src/exception.js ]]; then
  echo "Adding exception.js"
  cat "src/exception.js" >> dist.js
fi

FILES=`ls -1 src`
while read FILE; do
  if [[ "${FILE}" != "header.js" ]] && [[ "${FILE}" != "exception.js" ]] && [[ -f "src/${FILE}" ]]; then
    echo "Adding ${FILE}"
    cat "src/${FILE}" >> dist.js
  fi
done <<EOF
${FILES}
EOF

FILES=`ls -1 src/plugins`
while read FILE; do
  echo "Adding plugins/${FILE}"
  cat "src/plugins/${FILE}" >> dist.js
done <<EOF
${FILES}
EOF

echo "Finished building library, output in dist.js"
echo "Don't forget to minify!"
exit 0
