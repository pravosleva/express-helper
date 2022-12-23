dir_copy() {
  srcDir=$1
  destDir=$2

  for i in $srcDir/*; do cp -r $i $destDir; done;
}
