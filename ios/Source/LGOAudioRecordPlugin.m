//
//  LGOAudioRecordPlugin.m
//  plugin

#import "LGOAudioRecordPlugin.h"
#import <LEGO-SDK/LGOCore.h>
#import <AVFoundation/AVFoundation.h>

@class LGOAudioRecordperation;
@interface PluginAudioRecorder : NSObject <AVAudioRecorderDelegate>
@property (nonatomic, copy) LGORequestableAsynchronizeBlock callbackBlock;
+ (instancetype)sharedInstance;
- (void)handleRecoderWithOperation:(LGOAudioRecordperation *)operation;
@end

@interface LGOAudioRecordRequest: LGORequest

@property (nonatomic, copy) NSString *opt;
//@property (nonatomic, assign) NSInteger duration;

@end

@implementation LGOAudioRecordRequest

@end

@interface LGOAudioRecordResponse: LGOResponse

@property (nonatomic, copy) NSString *fileURL;

@end

@implementation LGOAudioRecordResponse

- (NSDictionary *)resData {
    return @{
             @"fileURL": self.fileURL ?: @"",
             };
}

@end

@interface LGOAudioRecordperation: LGORequestable

@property (nonatomic, strong) LGOAudioRecordRequest *request;

@end

@implementation LGOAudioRecordperation
- (void)requestAsynchronize:(LGORequestableAsynchronizeBlock)callbackBlock {
    [[NSOperationQueue mainQueue] addOperationWithBlock:^{
        [PluginAudioRecorder sharedInstance].callbackBlock = callbackBlock;
        [[PluginAudioRecorder sharedInstance] handleRecoderWithOperation:self];
    }];
}


@end

@implementation LGOAudioRecordPlugin

- (LGORequestable *)buildWithDictionary:(NSDictionary *)dictionary context:(LGORequestContext *)context {
    LGOAudioRecordperation *operation = [LGOAudioRecordperation new];
    operation.request = [LGOAudioRecordRequest new];
    operation.request.opt = [dictionary[@"opt"] isKindOfClass:[NSString class]] ? dictionary[@"opt"] : nil;
//    operation.request.duration = [dictionary[@"duration"] isKindOfClass:[NSNumber class]] ? [dictionary[@"duration"] integerValue] : 0;
    return operation;
}

- (LGORequestable *)buildWithRequest:(LGORequest *)request {
    if ([request isKindOfClass:[LGOAudioRecordRequest class]]) {
        LGOAudioRecordperation *operation = [LGOAudioRecordperation new];
        operation.request = (LGOAudioRecordRequest *)request;
        return operation;
    }
    return nil;
}

+ (void)load {
    [[LGOCore modules] addModuleWithName:@"Plugin.AudioRecord" instance:[self new]];
}

@end


@interface PluginAudioRecorder()
@property (nonatomic, strong) AVAudioRecorder *currentRecorder;
@end
@implementation PluginAudioRecorder

static PluginAudioRecorder *singleton = nil;

#pragma mark Singleton Methods

+ (instancetype)sharedInstance {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        singleton = [[super allocWithZone:NULL] init];
    });
    return singleton;
}

+ (id)allocWithZone:(struct _NSZone *)zone {
    return [PluginAudioRecorder sharedInstance];
}

- (id)copyWithZone:(struct _NSZone *)zone {
    return [PluginAudioRecorder sharedInstance];
}

- (void)handleRecoderWithOperation:(LGOAudioRecordperation *)operation {
    AVAudioSession *session =[AVAudioSession sharedInstance];
    NSError *sessionError;
    [session setCategory:AVAudioSessionCategoryPlayAndRecord error:&sessionError];
    if (sessionError) {
        self.callbackBlock([[LGOAudioRecordResponse new] reject:sessionError]);
        return;
    }
    
    if ([operation.request.opt isEqualToString:@"start"]) {
        if (self.currentRecorder.isRecording) {
            [self.currentRecorder stop];
            self.currentRecorder = nil;
            self.currentRecorder.delegate = nil;
        }
        NSError *recorderError;
        [[PluginAudioRecorder sharedInstance] initRecorderWithError:recorderError];
        if (recorderError) {
            self.callbackBlock([[LGOAudioRecordResponse new] reject:recorderError]);
            return;
        }
        [self.currentRecorder prepareToRecord];
        [self.currentRecorder record];
    } else if ([operation.request.opt isEqualToString:@"pause"]) {
        [self.currentRecorder pause];
    } else if ([operation.request.opt isEqualToString:@"stop"]) {
        [self.currentRecorder stop];
    }
    
}

- (NSURL *)audioFileURL {
    NSString *path = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy-MM-DD_HH-mm-ss";
    NSString *dateString = [formatter stringFromDate:[NSDate date]];
    NSString *filePath = [path stringByAppendingFormat:@"/%@_audioRecord.wav", dateString];
    return [NSURL fileURLWithPath:filePath];
}

- (void)initRecorderWithError:(NSError *)recorderError
{
    NSDictionary *recordSetting = [[NSDictionary alloc] initWithObjectsAndKeys:
                                   [NSNumber numberWithFloat: 8000.0],AVSampleRateKey,
                                   [NSNumber numberWithInt: kAudioFormatLinearPCM],AVFormatIDKey,
                                   [NSNumber numberWithInt:16],AVLinearPCMBitDepthKey,
                                   [NSNumber numberWithInt: 1], AVNumberOfChannelsKey,
                                   [NSNumber numberWithInt:AVAudioQualityHigh],AVEncoderAudioQualityKey,
                                   nil];
    self.currentRecorder = [[AVAudioRecorder alloc] initWithURL:[self audioFileURL] settings:recordSetting error:&recorderError];
    self.currentRecorder.delegate = [PluginAudioRecorder sharedInstance];
}

#pragma mark AVAudioRecorder delegate
- (void)audioRecorderDidFinishRecording:(AVAudioRecorder *)recorder successfully:(BOOL)flag {
    if (flag) {
        LGOAudioRecordResponse *response = [LGOAudioRecordResponse new];
        response.fileURL = [PluginAudioRecorder sharedInstance].currentRecorder.url.absoluteString;
        
        [PluginAudioRecorder sharedInstance].callbackBlock([response accept:nil]);
    } else {
        [PluginAudioRecorder sharedInstance].callbackBlock([[LGOAudioRecordResponse new] reject:[NSError errorWithDomain:@"Plugin.AudioRecorder" code:-1 userInfo:@{NSLocalizedDescriptionKey : @"did finish recording but audio encoding error occur"}]]);
    }
}

- (void)audioRecorderEncodeErrorDidOccur:(AVAudioRecorder *)recorder error:(NSError * __nullable)error {
    [PluginAudioRecorder sharedInstance].callbackBlock([[LGOAudioRecordResponse new] reject:error]);
}
@end
