# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-09-14 12:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_auto_20170907_1210'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dataset',
            name='slug',
            field=models.SlugField(max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='insight',
            name='slug',
            field=models.SlugField(blank=True, max_length=300),
        ),
        migrations.AlterField(
            model_name='job',
            name='slug',
            field=models.SlugField(max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='robo',
            name='slug',
            field=models.SlugField(blank=True, max_length=300),
        ),
        migrations.AlterField(
            model_name='score',
            name='slug',
            field=models.SlugField(blank=True, max_length=300),
        ),
        migrations.AlterField(
            model_name='trainer',
            name='slug',
            field=models.SlugField(blank=True, max_length=300),
        ),
    ]
