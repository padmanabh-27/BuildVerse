from rest_framework import serializers


class TeamMatchingSerializer(serializers.Serializer):
    query = serializers.CharField()

    region_filter = serializers.BooleanField(default=False)

    country = serializers.CharField(required=False, allow_blank=True)

    state = serializers.CharField(required=False, allow_blank=True)

    city = serializers.CharField(required=False, allow_blank=True)
