//
//  ViewController.m
//  plugin
//
//  Created by 崔明辉 on 2017/10/17.
//  Copyright © 2017年 UED Center, YY Inc. All rights reserved.
//

#import "ViewController.h"
#import <LEGO-SDK/LGOWKWebView.h>

@interface ViewController ()

@property (nonatomic, strong) LGOWKWebView *webView;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.webView = [[LGOWKWebView alloc] init];
    [self.view addSubview:self.webView];
    NSString *samplePage = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"sample" ofType:@"html"] encoding:NSUTF8StringEncoding error:NULL];
    [self.webView loadHTMLString:samplePage baseURL:nil];
}

- (void)viewWillLayoutSubviews {
    [super viewWillLayoutSubviews];
    self.webView.frame = self.view.bounds;
}

@end
