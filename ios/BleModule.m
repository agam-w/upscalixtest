#import "BleModule.h"

@implementation BleModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"bleStateChanged", @"bleDeviceFound"];
}

@end