#!/bin/bash
if [[ -r src/header.js ]]; then
  echo "Preparing dist.js with contents of header.js"
  cp src/header.js dist.js
else
  rm dist.js
  touch dist.js
fi

FILES=`ls -1 src`
while read FILE; do
  if [[ "${FILE}" != "header.js" ]]; then
    echo "Adding ${FILE}"
    cat "src/${FILE}" >> dist.js
  fi
done <<EOF
${FILES}
EOF

echo "Finished building library, output in dist.js"
echo "Don't forget to minify!"
exit 0
