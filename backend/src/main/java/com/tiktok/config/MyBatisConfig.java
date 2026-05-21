package com.tiktok.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.tiktok.*.mapper")
public class MyBatisConfig {

}
