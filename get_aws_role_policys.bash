ROLE_NAME="<role-name>"

# 관리형 정책 가져오기
echo "Attached Managed Policies:"
aws iam list-attached-role-policies --role-name $ROLE_NAME --query 'AttachedPolicies[*].PolicyArn'

# 인라인 정책 가져오기
echo "Inline Policies:"
INLINE_POLICIES=$(aws iam list-role-policies --role-name $ROLE_NAME --query 'PolicyNames[*]' --output text)

for policy in $INLINE_POLICIES; do
    echo "Policy Name: $policy"
    aws iam get-role-policy --role-name $ROLE_NAME --policy-name $policy
done
