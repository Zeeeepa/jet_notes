# source shell/named-arguments.sh STEPS="ABC" REPOSITORY_NAME="stackexchange" EXTRA_VALUES="KEY1=VALUE1 KEY2=VALUE2"

for ARGUMENT in "$@"
do
   KEY=$(echo $ARGUMENT | cut -f1 -d=)

   KEY_LENGTH=${#KEY}
   VALUE="${ARGUMENT:$KEY_LENGTH+1}"

   export "$KEY"="$VALUE"
done

### use here your expected variables ###
# echo "STEPS=$STEPS"
# echo "REPOSITORY_NAME=$REPOSITORY_NAME"
# echo "EXTRA_VALUES=$EXTRA_VALUES"